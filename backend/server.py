from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Header, Response, Query
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import json
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from pywebpush import webpush_async, WebPushException
from models import (
    Product, ProductCreate, User, UserRegister, UserLogin, UserAddress,
    Cart, CartItem, Order, OrderCreate, OrderItem, DiscountCode,
    ChatMessage, LoyaltyTransaction,
    PushSubscription, PushSubscriptionCreate, PushUnsubscribe
)
from storage import init_storage, put_object, get_object

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get("JWT_SECRET", "waheeba-fashion-secret-key-2024")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

VAPID_PUBLIC_KEY = os.environ.get("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
VAPID_SUBJECT = os.environ.get("VAPID_SUBJECT", "mailto:info@waheebafashion.com")
PUSH_SEND_CONCURRENCY = 20

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

LOYALTY_POINTS_CONFIG = {
    # نقطة واحدة لكل 10 د.أ من قيمة الطلب
    "points_per_amount": 10,
    # الاستبدال يتم بشرائح: كل 200 نقطة = 10 د.أ خصم
    "redemption_threshold": 200,
    "redemption_value": 10.0,
    "welcome_bonus": 50,
    "referrer_bonus": 100,
    "referred_bonus": 50
}


def calculate_points_discount(points: int, subtotal: float) -> tuple:
    """Convert loyalty points into a discount.

    Points are only redeemable in whole blocks (200 -> 10 د.أ), and the
    discount never exceeds the value of the products themselves, so an order
    can never end up negative. Returns the points actually consumed and the
    discount they bought.
    """
    threshold = LOYALTY_POINTS_CONFIG["redemption_threshold"]
    value = LOYALTY_POINTS_CONFIG["redemption_value"]

    blocks = points // threshold
    if blocks <= 0:
        return 0, 0.0

    affordable_blocks = int(subtotal // value)
    blocks = min(blocks, affordable_blocks)
    if blocks <= 0:
        return 0, 0.0

    return blocks * threshold, round(blocks * value, 2)


def generate_referral_code(full_name: str) -> str:
    """Generate a unique referral code from user name."""
    import re
    clean_name = re.sub(r'[^a-zA-Z\u0600-\u06FF]', '', full_name).upper()[:4]
    if not clean_name:
        clean_name = "USER"
    suffix = str(uuid.uuid4())[:6].upper()
    return f"{clean_name}{suffix}"

DELIVERY_FEES = {
    "default": 30.0
}


def create_token(user_id: str, email: str, is_admin: bool) -> str:
    payload = {"user_id": user_id, "email": email, "is_admin": is_admin}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing")
    token = authorization.split(" ")[1]
    return verify_token(token)


@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init error (non-blocking): {e}")

    try:
        await db.push_subscriptions.create_index("endpoint", unique=True)
        if not push_is_configured():
            logger.warning("VAPID keys missing - push notifications are disabled")
    except Exception as e:
        logger.error(f"Push index error (non-blocking): {e}")

    try:
        admin_exists = await db.users.find_one({"email": "admin@waheebafashion.com"})
        if not admin_exists:
            password_hash = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
            admin_user = User(
                email="admin@waheebafashion.com",
                full_name="Waheeba Admin",
                phone="0000000000",
                password_hash=password_hash,
                is_admin=True,
                loyalty_points=0
            )
            doc = admin_user.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.users.insert_one(doc)
            logger.info("Admin user created")
    except Exception as e:
        logger.error(f"Admin creation error: {e}")


@api_router.get("/")
async def root():
    return {"message": "Waheeba Fashion API", "status": "running"}


@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = bcrypt.hashpw(user_data.password.encode(), bcrypt.gensalt()).decode()
    
    # Generate unique referral code
    while True:
        ref_code = generate_referral_code(user_data.full_name)
        exists = await db.users.find_one({"referral_code": ref_code})
        if not exists:
            break
    
    welcome_points = LOYALTY_POINTS_CONFIG["welcome_bonus"]
    referrer_user = None
    
    # Validate referral code if provided
    if user_data.referral_code:
        referrer_user = await db.users.find_one(
            {"referral_code": user_data.referral_code.upper().strip()},
            {"_id": 0}
        )
        if referrer_user:
            welcome_points += LOYALTY_POINTS_CONFIG["referred_bonus"]
    
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        password_hash=password_hash,
        loyalty_points=welcome_points,
        referral_code=ref_code,
        referred_by=referrer_user["id"] if referrer_user else None
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Welcome bonus transaction
    transaction = LoyaltyTransaction(
        user_id=user.id,
        points=LOYALTY_POINTS_CONFIG["welcome_bonus"],
        transaction_type="bonus",
        description="مكافأة الترحيب"
    )
    trans_doc = transaction.model_dump()
    trans_doc['created_at'] = trans_doc['created_at'].isoformat()
    await db.loyalty_transactions.insert_one(trans_doc)
    
    # Handle referral rewards
    if referrer_user:
        # Bonus for new user
        referred_trans = LoyaltyTransaction(
            user_id=user.id,
            points=LOYALTY_POINTS_CONFIG["referred_bonus"],
            transaction_type="referral_signup",
            description=f"مكافأة استخدام كود الإحالة {user_data.referral_code}"
        )
        rt_doc = referred_trans.model_dump()
        rt_doc['created_at'] = rt_doc['created_at'].isoformat()
        await db.loyalty_transactions.insert_one(rt_doc)
        
        # Bonus for referrer
        referrer_bonus = LOYALTY_POINTS_CONFIG["referrer_bonus"]
        await db.users.update_one(
            {"id": referrer_user["id"]},
            {
                "$inc": {"loyalty_points": referrer_bonus, "referral_count": 1}
            }
        )
        referrer_trans = LoyaltyTransaction(
            user_id=referrer_user["id"],
            points=referrer_bonus,
            transaction_type="referral_reward",
            description=f"مكافأة إحالة صديق: {user_data.full_name}"
        )
        rtr_doc = referrer_trans.model_dump()
        rtr_doc['created_at'] = rtr_doc['created_at'].isoformat()
        await db.loyalty_transactions.insert_one(rtr_doc)
    
    token = create_token(user.id, user.email, user.is_admin)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "loyalty_points": user.loyalty_points,
            "is_admin": user.is_admin,
            "referral_code": user.referral_code,
            "referral_count": user.referral_count
        }
    }


@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode(), user_doc["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user_doc["id"], user_doc["email"], user_doc["is_admin"])
    return {
        "token": token,
        "user": {
            "id": user_doc["id"],
            "email": user_doc["email"],
            "full_name": user_doc["full_name"],
            "phone": user_doc["phone"],
            "loyalty_points": user_doc.get("loyalty_points", 0),
            "is_admin": user_doc.get("is_admin", False),
            "referral_code": user_doc.get("referral_code", ""),
            "referral_count": user_doc.get("referral_count", 0)
        }
    }


@api_router.get("/referral/validate/{code}")
async def validate_referral_code(code: str):
    user_doc = await db.users.find_one(
        {"referral_code": code.upper().strip()},
        {"_id": 0, "full_name": 1, "referral_code": 1}
    )
    if not user_doc:
        return {"valid": False}
    return {
        "valid": True,
        "referrer_name": user_doc["full_name"],
        "bonus_points": LOYALTY_POINTS_CONFIG["referred_bonus"]
    }


@api_router.get("/auth/me")
async def get_me(authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    user_doc = await db.users.find_one({"id": user_data["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return user_doc


@api_router.post("/products")
async def create_product(product: ProductCreate, authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    if not user_data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    available_colors = list(set([v.color for v in product.variants]))
    available_sizes = list(set([v.size for v in product.variants]))
    total_stock = sum([v.stock for v in product.variants])
    
    product_obj = Product(
        **product.model_dump(),
        available_colors=available_colors,
        available_sizes=available_sizes,
        total_stock=total_stock
    )
    
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.products.insert_one(doc)
    
    return product_obj


@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_new: Optional[bool] = None,
    is_on_sale: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    limit: int = 50,
    skip: int = 0
):
    query = {}
    
    if category:
        query["category"] = category
    if is_featured is not None:
        query["is_featured"] = is_featured
    if is_new is not None:
        query["is_new"] = is_new
    if is_on_sale is not None:
        query["is_on_sale"] = is_on_sale
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if search:
        query["name_ar"] = {"$regex": search, "$options": "i"}
    
    sort_order = -1 if sort_by in ["created_at", "sold_count", "price_desc"] else 1
    sort_field = "price" if "price" in sort_by else sort_by
    
    products = await db.products.find(query, {"_id": 0}).sort(sort_field, sort_order).skip(skip).limit(limit).to_list(limit)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product.get('updated_at'), str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    return products


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product.get('updated_at'), str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    return product


@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductCreate, authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    if not user_data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    available_colors = list(set([v.color for v in product.variants]))
    available_sizes = list(set([v.size for v in product.variants]))
    total_stock = sum([v.stock for v in product.variants])
    
    update_data = product.model_dump()
    update_data["available_colors"] = available_colors
    update_data["available_sizes"] = available_sizes
    update_data["total_stock"] = total_stock
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    return {"message": "Product updated successfully"}


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    if not user_data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}


@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    if not user_data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    import base64
    
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    data = await file.read()
    
    max_size = 5 * 1024 * 1024
    if len(data) > max_size:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    base64_data = base64.b64encode(data).decode("utf-8")
    
    file_id = str(uuid.uuid4())
    file_doc = {
        "id": file_id,
        "base64_data": base64_data,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": len(data),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.uploaded_files.insert_one(file_doc)
    
    return {"url": f"/api/uploads/{file_id}", "id": file_id, "size": len(data)}


@api_router.get("/uploads/{file_id}")
async def get_uploaded_file(file_id: str):
    import base64
    file_doc = await db.uploaded_files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    data = base64.b64decode(file_doc["base64_data"])
    return Response(
        content=data,
        media_type=file_doc["content_type"],
        headers={"Cache-Control": "public, max-age=31536000"}
    )


@api_router.get("/files/{path:path}")
async def download_file(path: str):
    file_record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    data, content_type = get_object(path)
    return Response(content=data, media_type=file_record.get("content_type", content_type))


@api_router.post("/cart")
async def add_to_cart(item: CartItem, session_id: Optional[str] = None, authorization: str = Header(None)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            user_data = await get_current_user(authorization)
            user_id = user_data["user_id"]
        except Exception:
            pass
    
    if not user_id and not session_id:
        session_id = str(uuid.uuid4())
    
    query = {"user_id": user_id} if user_id else {"session_id": session_id}
    cart = await db.carts.find_one(query, {"_id": 0})
    
    if not cart:
        cart = Cart(user_id=user_id, session_id=session_id, items=[item])
        cart.total_amount = item.price * item.quantity
        doc = cart.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.carts.insert_one(doc)
    else:
        items = [CartItem(**i) for i in cart["items"]]
        found = False
        for i, cart_item in enumerate(items):
            if (cart_item.product_id == item.product_id and 
                cart_item.color == item.color and 
                cart_item.size == item.size):
                items[i].quantity += item.quantity
                found = True
                break
        
        if not found:
            items.append(item)
        
        total = sum([i.price * i.quantity for i in items])
        await db.carts.update_one(
            query,
            {"$set": {
                "items": [i.model_dump() for i in items],
                "total_amount": total,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    
    return {"message": "Item added to cart", "session_id": session_id}


@api_router.get("/cart")
async def get_cart(session_id: Optional[str] = None, authorization: str = Header(None)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            user_data = await get_current_user(authorization)
            user_id = user_data["user_id"]
        except Exception:
            pass
    
    query = {"user_id": user_id} if user_id else {"session_id": session_id}
    cart = await db.carts.find_one(query, {"_id": 0})
    
    if not cart:
        return {"items": [], "total_amount": 0.0}
    
    return cart


@api_router.put("/cart/{product_id}")
async def update_cart_item(
    product_id: str,
    color: str,
    size: str,
    quantity: int,
    session_id: Optional[str] = None,
    authorization: str = Header(None)
):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            user_data = await get_current_user(authorization)
            user_id = user_data["user_id"]
        except Exception:
            pass
    
    query = {"user_id": user_id} if user_id else {"session_id": session_id}
    cart = await db.carts.find_one(query, {"_id": 0})
    
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = [CartItem(**i) for i in cart["items"]]
    updated = False
    
    for i, item in enumerate(items):
        if item.product_id == product_id and item.color == color and item.size == size:
            if quantity <= 0:
                items.pop(i)
            else:
                items[i].quantity = quantity
            updated = True
            break
    
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    total = sum([i.price * i.quantity for i in items])
    await db.carts.update_one(
        query,
        {"$set": {
            "items": [i.model_dump() for i in items],
            "total_amount": total,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Cart updated successfully"}


@api_router.delete("/cart")
async def clear_cart(session_id: Optional[str] = None, authorization: str = Header(None)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            user_data = await get_current_user(authorization)
            user_id = user_data["user_id"]
        except Exception:
            pass
    
    query = {"user_id": user_id} if user_id else {"session_id": session_id}
    await db.carts.delete_one(query)
    
    return {"message": "Cart cleared successfully"}


@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    if user_data["user_id"] != order_data.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    user = await db.users.find_one({"id": order_data.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    subtotal = sum([item.price * item.quantity for item in order_data.items])
    delivery_fee = DELIVERY_FEES["default"]
    
    points_used = 0
    points_discount = 0.0
    if order_data.use_loyalty_points > 0:
        if user["loyalty_points"] < order_data.use_loyalty_points:
            raise HTTPException(status_code=400, detail="Insufficient loyalty points")
        points_used, points_discount = calculate_points_discount(
            order_data.use_loyalty_points, subtotal
        )

    total_amount = subtotal + delivery_fee - points_discount
    
    order_number = f"WF{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"
    
    points_earned = int(total_amount / LOYALTY_POINTS_CONFIG["points_per_amount"])
    
    order = Order(
        order_number=order_number,
        user_id=order_data.user_id,
        user_email=user["email"],
        user_name=user["full_name"],
        user_phone=user["phone"],
        shipping_address=order_data.shipping_address,
        items=[OrderItem(**item.model_dump()) for item in order_data.items],
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        points_discount=points_discount,
        total_amount=total_amount,
        payment_method=order_data.payment_method,
        notes=order_data.notes,
        preview_service_requested=order_data.preview_service_requested,
        points_earned=points_earned
    )
    
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.orders.insert_one(doc)
    
    new_points = user["loyalty_points"] - points_used + points_earned
    await db.users.update_one(
        {"id": order_data.user_id},
        {"$set": {"loyalty_points": new_points, "total_spent": user.get("total_spent", 0) + total_amount}}
    )

    if points_used > 0:
        trans = LoyaltyTransaction(
            user_id=order_data.user_id,
            points=-points_used,
            transaction_type="redemption",
            description=f"استخدام {points_used} نقطة في الطلب {order_number} (خصم {points_discount:.2f} د.أ)",
            order_id=order.id
        )
        trans_doc = trans.model_dump()
        trans_doc['created_at'] = trans_doc['created_at'].isoformat()
        await db.loyalty_transactions.insert_one(trans_doc)
    
    if points_earned > 0:
        trans = LoyaltyTransaction(
            user_id=order_data.user_id,
            points=points_earned,
            transaction_type="purchase",
            description=f"نقاط من الطلب {order_number}",
            order_id=order.id
        )
        trans_doc = trans.model_dump()
        trans_doc['created_at'] = trans_doc['created_at'].isoformat()
        await db.loyalty_transactions.insert_one(trans_doc)
    
    await db.carts.delete_one({"user_id": order_data.user_id})
    
    return order


@api_router.get("/orders", response_model=List[Order])
async def get_orders(authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    
    if user_data.get("is_admin"):
        orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    else:
        orders = await db.orders.find({"user_id": user_data["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
        if isinstance(order.get('updated_at'), str):
            order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    
    return orders


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not user_data.get("is_admin") and order["user_id"] != user_data["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    if isinstance(order.get('updated_at'), str):
        order['updated_at'] = datetime.fromisoformat(order['updated_at'])
    
    return order


@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    if not user_data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    valid_statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully"}


@api_router.get("/loyalty/config")
async def get_loyalty_config():
    """Single source of truth for the loyalty rules shown in the UI."""
    return {
        "points_per_amount": LOYALTY_POINTS_CONFIG["points_per_amount"],
        "redemption_threshold": LOYALTY_POINTS_CONFIG["redemption_threshold"],
        "redemption_value": LOYALTY_POINTS_CONFIG["redemption_value"],
        "welcome_bonus": LOYALTY_POINTS_CONFIG["welcome_bonus"],
        "referrer_bonus": LOYALTY_POINTS_CONFIG["referrer_bonus"],
        "referred_bonus": LOYALTY_POINTS_CONFIG["referred_bonus"],
        "delivery_fee": DELIVERY_FEES["default"]
    }


@api_router.get("/loyalty/transactions")
async def get_loyalty_transactions(authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    
    transactions = await db.loyalty_transactions.find(
        {"user_id": user_data["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for trans in transactions:
        if isinstance(trans.get('created_at'), str):
            trans['created_at'] = datetime.fromisoformat(trans['created_at'])
    
    return transactions


@api_router.post("/chat/message")
async def chat_message(message: str, session_id: str):
    messages = await db.chat_messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=message
    )
    user_doc = user_msg.model_dump()
    user_doc['timestamp'] = user_doc['timestamp'].isoformat()
    await db.chat_messages.insert_one(user_doc)
    
    system_message = """أنت مساعد ذكي لمتجر وهيبة فاشن للملابس النسائية. دورك هو مساعدة الزبائن في:
    - اختيار المنتجات المناسبة
    - الإجابة عن أسئلة حول المقاسات والألوان
    - شرح سياسات الشحن والإرجاع
    - مساعدتهم في إتمام الطلبات
    - الإجابة عن أسئلة حول نظام نقاط الولاء
    
    كن لطيفاً ومفيداً واستخدم اللغة العربية الفصحى البسيطة."""
    
    # ملاحظة: المساعد الذكي (LLM) كان يعتمد على خدمة Emergent وتم تعطيله في هذه
    # النسخة المستضافة ذاتياً. نرسل رداً ثابتاً يوجّه الزبون للتواصل المباشر.
    _ = system_message  # الاحتفاظ بنص النظام كمرجع
    canned_response = (
        "شكراً لتواصلك مع وهيبة فاشن! 🌸 "
        "لأي استفسار عن المنتجات أو المقاسات أو الطلبات، تواصلي معنا مباشرةً "
        "عبر واتساب وسنسعد بخدمتك بأسرع وقت."
    )

    async def generate():
        import asyncio
        for word in canned_response.split(" "):
            yield f"data: {word} \n\n"
            await asyncio.sleep(0.02)

        assistant_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=canned_response
        )
        asst_doc = assistant_msg.model_dump()
        asst_doc['timestamp'] = asst_doc['timestamp'].isoformat()
        await db.chat_messages.insert_one(asst_doc)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


def push_is_configured() -> bool:
    return bool(VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY)


async def send_push_to_all(payload: dict) -> dict:
    """Deliver `payload` to every stored subscription.

    Endpoints that the push service reports as gone (404/410) are deleted, so
    the collection does not fill up with browsers that uninstalled the app or
    revoked permission.
    """
    if not push_is_configured():
        raise HTTPException(status_code=503, detail="Push notifications are not configured")

    subscriptions = await db.push_subscriptions.find({}, {"_id": 0}).to_list(100000)
    if not subscriptions:
        return {"sent": 0, "failed": 0, "removed": 0, "total": 0}

    body = json.dumps(payload, ensure_ascii=False)
    semaphore = asyncio.Semaphore(PUSH_SEND_CONCURRENCY)
    expired_endpoints = []
    sent = 0
    failed = 0

    async def deliver(sub):
        nonlocal sent, failed
        async with semaphore:
            try:
                await webpush_async(
                    subscription_info={"endpoint": sub["endpoint"], "keys": sub["keys"]},
                    data=body,
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims={"sub": VAPID_SUBJECT},
                    ttl=60 * 60 * 24,
                    timeout=10,
                )
                sent += 1
            except WebPushException as exc:
                failed += 1
                status = getattr(exc.response, "status", None)
                if status in (404, 410):
                    expired_endpoints.append(sub["endpoint"])
                else:
                    logger.warning("Push failed for %s: %s", sub["endpoint"][:60], exc)
            except Exception as exc:
                failed += 1
                logger.warning("Push error for %s: %s", sub["endpoint"][:60], exc)

    await asyncio.gather(*[deliver(sub) for sub in subscriptions])

    if expired_endpoints:
        await db.push_subscriptions.delete_many({"endpoint": {"$in": expired_endpoints}})

    return {
        "sent": sent,
        "failed": failed,
        "removed": len(expired_endpoints),
        "total": len(subscriptions)
    }


@api_router.get("/push/public-key")
async def get_push_public_key():
    return {"enabled": push_is_configured(), "public_key": VAPID_PUBLIC_KEY}


@api_router.post("/push/subscribe")
async def subscribe_to_push(
    subscription: PushSubscriptionCreate,
    authorization: str = Header(None),
    user_agent: str = Header("")
):
    user_id = None
    if authorization:
        try:
            user_id = (await get_current_user(authorization)).get("user_id")
        except HTTPException:
            pass

    record = PushSubscription(
        endpoint=subscription.endpoint,
        keys=subscription.keys,
        user_id=user_id,
        user_agent=user_agent[:300]
    )
    doc = record.model_dump()
    created_at = doc.pop('created_at').isoformat()
    doc.pop('id')

    await db.push_subscriptions.update_one(
        {"endpoint": subscription.endpoint},
        {"$set": doc, "$setOnInsert": {"id": record.id, "created_at": created_at}},
        upsert=True
    )
    return {"success": True}


@api_router.post("/push/unsubscribe")
async def unsubscribe_from_push(payload: PushUnsubscribe):
    await db.push_subscriptions.delete_one({"endpoint": payload.endpoint})
    return {"success": True}


@api_router.get("/push/subscribers")
async def count_push_subscribers(authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    if not user_data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return {
        "enabled": push_is_configured(),
        "count": await db.push_subscriptions.count_documents({})
    }


@api_router.post("/push/notify-product/{product_id}")
async def notify_new_product(product_id: str, authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    if not user_data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    images = product.get("images") or []
    primary = next((img for img in images if img.get("is_primary")), images[0] if images else None)

    result = await send_push_to_all({
        "title": "وصل جديد في وهيبة فاشن",
        "body": f"{product['name_ar']} — {product['price']:.2f} د.أ",
        "url": f"/products/{product_id}",
        "image": (primary or {}).get("url", ""),
        "tag": f"product-{product_id}"
    })

    await db.products.update_one(
        {"id": product_id},
        {"$set": {"notified_at": datetime.now(timezone.utc).isoformat()}}
    )
    return result


@api_router.get("/admin/stats")
async def get_admin_stats(authorization: str = Header(None)):
    user_data = await get_current_user(authorization)
    if not user_data.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({"is_admin": False})
    
    orders = await db.orders.find({}, {"_id": 0, "total_amount": 1, "status": 1}).to_list(10000)
    total_revenue = sum([o["total_amount"] for o in orders])
    pending_orders = len([o for o in orders if o["status"] == "pending"])
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_revenue": total_revenue,
        "pending_orders": pending_orders
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
