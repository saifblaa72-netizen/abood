"""Seed sample products for Waheeba Fashion"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


SAMPLE_PRODUCTS = [
    {
        "name_ar": "فستان سهرة أنيق - خمري",
        "description_ar": "فستان سهرة راقٍ باللون الخمري مع تطريز يدوي مميز، مناسب للمناسبات الخاصة والحفلات",
        "category": "dresses",
        "price": 599.0,
        "original_price": 799.0,
        "discount_percentage": 25.0,
        "images": [
            {"url": "https://images.pexels.com/photos/28232246/pexels-photo-28232246.jpeg", "alt": "فستان سهرة", "is_primary": True},
            {"url": "https://images.unsplash.com/photo-1583039949165-96ee24b0d8de", "alt": "فستان سهرة 2", "is_primary": False}
        ],
        "variants": [
            {"color": "خمري", "color_hex": "#722F37", "size": "S", "stock": 5, "sku": "DRESS-BUR-S-001"},
            {"color": "خمري", "color_hex": "#722F37", "size": "M", "stock": 8, "sku": "DRESS-BUR-M-001"},
            {"color": "خمري", "color_hex": "#722F37", "size": "L", "stock": 3, "sku": "DRESS-BUR-L-001"},
        ],
        "material_ar": "حرير طبيعي مع تطريز يدوي",
        "is_featured": True,
        "is_new": True,
        "is_on_sale": True,
        "rating": 4.8,
        "reviews_count": 24
    },
    {
        "name_ar": "عباية عصرية بأزرار ذهبية",
        "description_ar": "عباية أنيقة بتصميم عصري مع أزرار ذهبية فاخرة، مثالية للإطلالات اليومية والرسمية",
        "category": "abayas",
        "price": 450.0,
        "images": [
            {"url": "https://images.pexels.com/photos/23730880/pexels-photo-23730880.png", "alt": "عباية", "is_primary": True}
        ],
        "variants": [
            {"color": "أسود", "color_hex": "#0A0A0A", "size": "M", "stock": 10, "sku": "ABAYA-BLK-M-001"},
            {"color": "أسود", "color_hex": "#0A0A0A", "size": "L", "stock": 7, "sku": "ABAYA-BLK-L-001"},
        ],
        "material_ar": "قماش كريب فاخر",
        "is_featured": True,
        "is_new": False,
        "is_on_sale": False,
        "rating": 4.6,
        "reviews_count": 15
    },
    {
        "name_ar": "طقم كاجوال أنيق",
        "description_ar": "طقم أنيق يجمع بين الراحة والأناقة، مثالي للإطلالات اليومية",
        "category": "sets",
        "price": 350.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1483985988355-763728e1935b", "alt": "طقم", "is_primary": True}
        ],
        "variants": [
            {"color": "أبيض", "color_hex": "#FAFAFA", "size": "M", "stock": 12, "sku": "SET-WHT-M-001"},
        ],
        "material_ar": "قطن ممزوج",
        "is_featured": False,
        "is_new": True,
        "is_on_sale": False,
        "rating": 4.5,
        "reviews_count": 8
    },
    {
        "name_ar": "فستان صيفي ملون",
        "description_ar": "فستان صيفي خفيف ومريح بألوان زاهية",
        "category": "dresses",
        "price": 280.0,
        "original_price": 380.0,
        "discount_percentage": 26.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8", "alt": "فستان صيفي", "is_primary": True}
        ],
        "variants": [
            {"color": "أبيض", "color_hex": "#FAFAFA", "size": "S", "stock": 6, "sku": "DRESS-WHT-S-002"},
            {"color": "أبيض", "color_hex": "#FAFAFA", "size": "M", "stock": 4, "sku": "DRESS-WHT-M-002"},
        ],
        "material_ar": "قطن خفيف",
        "is_featured": True,
        "is_new": True,
        "is_on_sale": True,
        "rating": 4.7,
        "reviews_count": 12
    },
    {
        "name_ar": "إسدال حريري فاخر",
        "description_ar": "إسدال أنيق من الحرير الطبيعي بلمسة عصرية",
        "category": "shawls",
        "price": 220.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea", "alt": "إسدال", "is_primary": True}
        ],
        "variants": [
            {"color": "أسود", "color_hex": "#0A0A0A", "size": "M", "stock": 15, "sku": "SHAWL-BLK-M-001"},
        ],
        "material_ar": "حرير طبيعي 100%",
        "is_featured": False,
        "is_new": False,
        "is_on_sale": False,
        "rating": 4.4,
        "reviews_count": 6
    },
    {
        "name_ar": "عباية ملكية بتطريز فاخر",
        "description_ar": "عباية ملكية مع تطريز يدوي فاخر، تليق بالمناسبات الملكية",
        "category": "abayas",
        "price": 850.0,
        "original_price": 1200.0,
        "discount_percentage": 30.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1509631179647-0177331693ae", "alt": "عباية ملكية", "is_primary": True}
        ],
        "variants": [
            {"color": "خمري", "color_hex": "#722F37", "size": "L", "stock": 3, "sku": "ABAYA-BUR-L-001"},
        ],
        "material_ar": "شيفون فاخر مع تطريز",
        "is_featured": True,
        "is_new": True,
        "is_on_sale": True,
        "rating": 4.9,
        "reviews_count": 18
    },
    {
        "name_ar": "فستان كوكتيل قصير",
        "description_ar": "فستان كوكتيل قصير أنيق مثالي للسهرات",
        "category": "dresses",
        "price": 480.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1566174053879-31528523f8ae", "alt": "فستان كوكتيل", "is_primary": True}
        ],
        "variants": [
            {"color": "أسود", "color_hex": "#0A0A0A", "size": "M", "stock": 7, "sku": "DRESS-BLK-M-003"},
        ],
        "material_ar": "شيفون مع تطريز",
        "is_featured": False,
        "is_new": True,
        "is_on_sale": False,
        "rating": 4.6,
        "reviews_count": 9
    },
    {
        "name_ar": "طقم رسمي أنيق",
        "description_ar": "طقم رسمي متكامل بلمسة عصرية",
        "category": "sets",
        "price": 520.0,
        "images": [
            {"url": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1", "alt": "طقم رسمي", "is_primary": True}
        ],
        "variants": [
            {"color": "خمري", "color_hex": "#722F37", "size": "M", "stock": 5, "sku": "SET-BUR-M-002"},
        ],
        "material_ar": "قماش رسمي فاخر",
        "is_featured": True,
        "is_new": False,
        "is_on_sale": False,
        "rating": 4.7,
        "reviews_count": 11
    }
]


async def seed():
    await db.products.delete_many({})
    print("Cleared existing products")
    
    for product_data in SAMPLE_PRODUCTS:
        available_colors = list(set([v["color"] for v in product_data["variants"]]))
        available_sizes = list(set([v["size"] for v in product_data["variants"]]))
        total_stock = sum([v["stock"] for v in product_data["variants"]])
        
        doc = {
            "id": str(uuid.uuid4()),
            **product_data,
            "available_colors": available_colors,
            "available_sizes": available_sizes,
            "total_stock": total_stock,
            "sold_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.products.insert_one(doc)
        print(f"Added: {product_data['name_ar']}")
    
    print(f"\nSeeded {len(SAMPLE_PRODUCTS)} products successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
