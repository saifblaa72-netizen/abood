from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class ProductImage(BaseModel):
    url: str
    alt: str = ""
    is_primary: bool = False


class ProductVariant(BaseModel):
    color: str
    color_hex: str
    size: str
    stock: int = 0
    sku: str


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_ar: str
    description_ar: str
    category: str
    price: float
    original_price: Optional[float] = None
    discount_percentage: Optional[float] = None
    images: List[ProductImage] = []
    variants: List[ProductVariant] = []
    available_colors: List[str] = []
    available_sizes: List[str] = []
    material_ar: str = ""
    is_featured: bool = False
    is_new: bool = False
    is_on_sale: bool = False
    total_stock: int = 0
    sold_count: int = 0
    rating: float = 0.0
    reviews_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductCreate(BaseModel):
    name_ar: str
    description_ar: str
    category: str
    price: float
    original_price: Optional[float] = None
    discount_percentage: Optional[float] = None
    images: List[ProductImage] = []
    variants: List[ProductVariant] = []
    material_ar: str = ""
    is_featured: bool = False
    is_new: bool = False
    is_on_sale: bool = False


class UserAddress(BaseModel):
    full_name: str
    phone: str
    governorate: str
    city: str
    address_line: str
    is_default: bool = False


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    full_name: str
    phone: str
    password_hash: str
    addresses: List[UserAddress] = []
    loyalty_points: int = 0
    total_spent: float = 0.0
    is_admin: bool = False
    referral_code: str = ""
    referred_by: Optional[str] = None
    referral_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserRegister(BaseModel):
    email: str
    full_name: str
    phone: str
    password: str
    referral_code: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class CartItem(BaseModel):
    product_id: str
    name_ar: str
    image_url: str
    price: float
    color: str
    size: str
    quantity: int
    sku: str


class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    items: List[CartItem] = []
    total_amount: float = 0.0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderItem(BaseModel):
    product_id: str
    name_ar: str
    image_url: str
    price: float
    color: str
    size: str
    quantity: int
    sku: str


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    user_id: str
    user_email: str
    user_name: str
    user_phone: str
    shipping_address: UserAddress
    items: List[OrderItem]
    subtotal: float
    delivery_fee: float
    points_discount: float = 0.0
    total_amount: float
    payment_method: str
    status: str = "pending"
    notes: str = ""
    preview_service_requested: bool = False
    points_earned: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class OrderCreate(BaseModel):
    user_id: str
    shipping_address: UserAddress
    items: List[CartItem]
    payment_method: str
    notes: str = ""
    use_loyalty_points: int = 0
    preview_service_requested: bool = False


class DiscountCode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_type: str
    discount_value: float
    min_purchase: float = 0.0
    max_uses: Optional[int] = None
    used_count: int = 0
    valid_from: datetime
    valid_until: datetime
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: Optional[str] = None
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LoyaltyTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    points: int
    transaction_type: str
    description: str
    order_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
