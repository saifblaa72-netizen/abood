"""New feature tests: preview_service_requested + image upload endpoint."""
import io
import os
import uuid
import requests
import pytest


# ---------------- Preview Service (Order flag) ----------------
class TestPreviewService:
    def _get_or_create_product_with_variants(self, base_url, admin_token):
        """Return a product with at least one variant. Create one if none exist."""
        products = requests.get(f"{base_url}/api/products?limit=100").json()
        for p in products:
            if p.get("variants") and len(p["variants"]) > 0:
                return p
        # Create a product with a variant via admin
        payload = {
            "name_ar": "TEST_منتج",
            "description_ar": "test",
            "category": "dresses",
            "price": 100.0,
            "images": [{"url": "https://example.com/x.jpg", "alt": "x", "is_primary": True}],
            "variants": [{
                "color": "خمري", "color_hex": "#722F37",
                "size": "M", "stock": 10, "sku": f"TEST-{uuid.uuid4().hex[:6]}"
            }],
            "is_featured": False, "is_new": True, "is_on_sale": False,
        }
        r = requests.post(
            f"{base_url}/api/products", json=payload,
            headers={"Authorization": f"Bearer {admin_token}"}, timeout=15,
        )
        assert r.status_code == 200, r.text
        return r.json()

    def test_create_order_with_preview_service_true(self, user_client, test_user, admin_token, base_url):
        product = self._get_or_create_product_with_variants(base_url, admin_token)
        variant = product["variants"][0]
        payload = {
            "user_id": test_user["user"]["id"],
            "shipping_address": {
                "full_name": "TEST User", "phone": "0501234567",
                "governorate": "الرياض", "city": "الرياض",
                "address_line": "شارع الاختبار", "is_default": True,
            },
            "items": [{
                "product_id": product["id"], "name_ar": product["name_ar"],
                "image_url": product["images"][0]["url"] if product["images"] else "",
                "price": product["price"], "color": variant["color"],
                "size": variant["size"], "quantity": 2, "sku": variant["sku"],
            }],
            "payment_method": "cod",
            "notes": "preview test",
            "use_loyalty_points": 0,
            "preview_service_requested": True,
        }
        r = user_client.post(f"{base_url}/api/orders", json=payload)
        assert r.status_code == 200, r.text
        order = r.json()
        assert order["preview_service_requested"] is True, "preview flag not returned on create"

        # Data assertion: items preserved with color/size/quantity
        assert len(order["items"]) == 1
        item = order["items"][0]
        assert item["color"] == variant["color"]
        assert item["size"] == variant["size"]
        assert item["quantity"] == 2

        # GET by id to verify persisted
        r2 = user_client.get(f"{base_url}/api/orders/{order['id']}")
        assert r2.status_code == 200
        fetched = r2.json()
        assert fetched["preview_service_requested"] is True
        assert fetched["items"][0]["color"] == variant["color"]
        assert fetched["items"][0]["size"] == variant["size"]
        assert fetched["items"][0]["quantity"] == 2

    def test_create_order_without_preview_defaults_false(self, user_client, test_user, admin_token, base_url):
        product = self._get_or_create_product_with_variants(base_url, admin_token)
        variant = product["variants"][0]
        payload = {
            "user_id": test_user["user"]["id"],
            "shipping_address": {
                "full_name": "TEST User", "phone": "0501234567",
                "governorate": "الرياض", "city": "الرياض",
                "address_line": "شارع الاختبار", "is_default": True,
            },
            "items": [{
                "product_id": product["id"], "name_ar": product["name_ar"],
                "image_url": "", "price": product["price"],
                "color": variant["color"], "size": variant["size"],
                "quantity": 1, "sku": variant["sku"],
            }],
            "payment_method": "cod",
            "notes": "",
            "use_loyalty_points": 0,
            # preview_service_requested omitted
        }
        r = user_client.post(f"{base_url}/api/orders", json=payload)
        assert r.status_code == 200, r.text
        assert r.json()["preview_service_requested"] is False

    def test_admin_can_see_preview_flag_in_orders(self, admin_client, base_url):
        r = admin_client.get(f"{base_url}/api/orders")
        assert r.status_code == 200
        orders = r.json()
        # At least one order must contain preview_service_requested field
        assert all("preview_service_requested" in o for o in orders), "field missing in admin listing"


# ---------------- Image Upload ----------------
# A tiny valid PNG (1x1 transparent pixel)
_TINY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf"
    b"\xc0\xf0\x1f\x00\x05\x00\x01\xfe\xa5\x8a\xd9]\x00\x00\x00\x00IEND"
    b"\xaeB`\x82"
)


class TestImageUpload:
    def test_upload_png_and_fetch(self, admin_token, base_url):
        # Multipart POST (do not use application/json header)
        files = {"file": ("tiny.png", _TINY_PNG, "image/png")}
        headers = {"Authorization": f"Bearer {admin_token}"}
        r = requests.post(f"{base_url}/api/upload", files=files, headers=headers, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data
        assert "id" in data
        assert data["url"].startswith("/api/uploads/")
        assert data["size"] == len(_TINY_PNG)

        file_id = data["id"]
        # Fetch back
        r2 = requests.get(f"{base_url}/api/uploads/{file_id}", timeout=15)
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/png")
        assert r2.content == _TINY_PNG, "returned bytes must match uploaded bytes"

    def test_upload_rejects_non_image(self, admin_token, base_url):
        files = {"file": ("not_image.txt", b"hello world", "text/plain")}
        headers = {"Authorization": f"Bearer {admin_token}"}
        r = requests.post(f"{base_url}/api/upload", files=files, headers=headers, timeout=15)
        assert r.status_code == 400
        assert "image" in r.json().get("detail", "").lower()

    def test_upload_requires_admin(self, user_client, base_url, test_user):
        files = {"file": ("tiny.png", _TINY_PNG, "image/png")}
        # user_client already has JSON content-type; remove for multipart to work
        headers = {"Authorization": f"Bearer {test_user['token']}"}
        r = requests.post(f"{base_url}/api/upload", files=files, headers=headers, timeout=15)
        assert r.status_code == 403

    def test_upload_missing_auth(self, base_url):
        files = {"file": ("tiny.png", _TINY_PNG, "image/png")}
        r = requests.post(f"{base_url}/api/upload", files=files, timeout=15)
        assert r.status_code == 401

    def test_upload_get_nonexistent(self, base_url):
        r = requests.get(f"{base_url}/api/uploads/nonexistent-id-xyz", timeout=15)
        assert r.status_code == 404
