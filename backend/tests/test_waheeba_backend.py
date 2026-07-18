"""Backend tests for Waheeba Fashion MVP - auth, products, cart, orders, admin, loyalty, chat."""
import os
import uuid
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.strip().split("=", 1)[1].strip().strip('"').rstrip("/")
                    break
    except Exception:
        pass


# ---------------- Health ----------------
class TestHealth:
    def test_root_endpoint(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "running"


# ---------------- Auth ----------------
class TestAuth:
    def test_admin_login(self, api_client, base_url):
        r = api_client.post(f"{base_url}/api/auth/login", json={
            "email": "admin@waheebafashion.com", "password": "admin123"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["is_admin"] is True
        assert "token" in data

    def test_admin_login_wrong_password(self, api_client, base_url):
        r = api_client.post(f"{base_url}/api/auth/login", json={
            "email": "admin@waheebafashion.com", "password": "wrongpassword"
        })
        assert r.status_code == 401

    def test_register_new_user_welcome_bonus(self, api_client, base_url):
        email = f"TEST_reg_{uuid.uuid4().hex[:8]}@example.com"
        r = api_client.post(f"{base_url}/api/auth/register", json={
            "email": email, "full_name": "Reg User", "phone": "0501111111", "password": "pass1234"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["loyalty_points"] == 50, "welcome bonus should be 50"
        assert data["user"]["email"] == email
        assert data["user"]["is_admin"] is False
        assert "token" in data

    def test_register_duplicate_email(self, api_client, base_url):
        email = f"TEST_dup_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"email": email, "full_name": "Dup", "phone": "0500000001", "password": "pass1234"}
        r1 = api_client.post(f"{base_url}/api/auth/register", json=payload)
        assert r1.status_code == 200
        r2 = api_client.post(f"{base_url}/api/auth/register", json=payload)
        assert r2.status_code == 400

    def test_get_me_authenticated(self, user_client, test_user, base_url):
        r = user_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == test_user["user"]["email"]
        assert data["loyalty_points"] == 50

    def test_get_me_no_auth(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 401


# ---------------- Products ----------------
class TestProducts:
    def test_list_products(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/products")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should have seeded products"

    def test_featured_products(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/products?is_featured=true")
        assert r.status_code == 200
        data = r.json()
        for p in data:
            assert p["is_featured"] is True

    def test_new_products(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/products?is_new=true")
        assert r.status_code == 200
        for p in r.json():
            assert p["is_new"] is True

    def test_filter_by_category(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/products?category=dresses")
        assert r.status_code == 200
        for p in r.json():
            assert p["category"] == "dresses"

    def test_search_products(self, api_client, base_url):
        # Use a fetched product name as search term
        all_r = api_client.get(f"{base_url}/api/products")
        assert all_r.status_code == 200
        products = all_r.json()
        if not products:
            pytest.skip("no products to search")
        term = products[0]["name_ar"][:3]
        r = api_client.get(f"{base_url}/api/products", params={"search": term})
        assert r.status_code == 200

    def test_get_product_by_id(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/products")
        pid = r.json()[0]["id"]
        r2 = api_client.get(f"{base_url}/api/products/{pid}")
        assert r2.status_code == 200
        assert r2.json()["id"] == pid

    def test_get_product_not_found(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/products/nonexistent-id-xyz")
        assert r.status_code == 404


# ---------------- Cart ----------------
class TestCart:
    def _get_first_product(self, base_url):
        r = requests.get(f"{base_url}/api/products")
        return r.json()[0]

    def test_add_and_get_cart_authenticated(self, user_client, base_url):
        product = self._get_first_product(base_url)
        variant = product["variants"][0]
        item = {
            "product_id": product["id"],
            "name_ar": product["name_ar"],
            "image_url": product["images"][0]["url"] if product["images"] else "",
            "price": product["price"],
            "color": variant["color"],
            "size": variant["size"],
            "quantity": 2,
            "sku": variant["sku"],
        }
        r = user_client.post(f"{base_url}/api/cart", json=item)
        assert r.status_code == 200, r.text

        # GET cart
        r2 = user_client.get(f"{base_url}/api/cart")
        assert r2.status_code == 200
        cart = r2.json()
        assert len(cart["items"]) >= 1
        found = [i for i in cart["items"] if i["product_id"] == product["id"]]
        assert found, "cart item not persisted"
        assert cart["total_amount"] >= product["price"] * 2

    def test_update_cart_quantity(self, user_client, base_url):
        product = self._get_first_product(base_url)
        variant = product["variants"][0]
        item = {
            "product_id": product["id"], "name_ar": product["name_ar"],
            "image_url": "", "price": product["price"],
            "color": variant["color"], "size": variant["size"],
            "quantity": 1, "sku": variant["sku"],
        }
        user_client.delete(f"{base_url}/api/cart")
        user_client.post(f"{base_url}/api/cart", json=item)
        # Update to quantity 5 via query params
        r = user_client.put(
            f"{base_url}/api/cart/{product['id']}",
            params={"color": variant["color"], "size": variant["size"], "quantity": 5},
        )
        assert r.status_code == 200, r.text
        cart = user_client.get(f"{base_url}/api/cart").json()
        target = [i for i in cart["items"] if i["product_id"] == product["id"]][0]
        assert target["quantity"] == 5

    def test_delete_cart_item_by_quantity_zero(self, user_client, base_url):
        product = self._get_first_product(base_url)
        variant = product["variants"][0]
        user_client.delete(f"{base_url}/api/cart")
        user_client.post(f"{base_url}/api/cart", json={
            "product_id": product["id"], "name_ar": product["name_ar"],
            "image_url": "", "price": product["price"],
            "color": variant["color"], "size": variant["size"],
            "quantity": 1, "sku": variant["sku"],
        })
        r = user_client.put(
            f"{base_url}/api/cart/{product['id']}",
            params={"color": variant["color"], "size": variant["size"], "quantity": 0},
        )
        assert r.status_code == 200

    def test_clear_cart(self, user_client, base_url):
        r = user_client.delete(f"{base_url}/api/cart")
        assert r.status_code == 200


# ---------------- Orders ----------------
class TestOrders:
    def test_create_order_cod_and_verify_loyalty(self, user_client, test_user, base_url):
        # Fetch a product
        products = requests.get(f"{base_url}/api/products").json()
        product = products[0]
        variant = product["variants"][0]

        user_id = test_user["user"]["id"]
        order_payload = {
            "user_id": user_id,
            "shipping_address": {
                "full_name": "TEST User",
                "phone": "0501234567",
                "governorate": "الرياض",
                "city": "الرياض",
                "address_line": "شارع الاختبار",
                "is_default": True,
            },
            "items": [{
                "product_id": product["id"],
                "name_ar": product["name_ar"],
                "image_url": "",
                "price": product["price"],
                "color": variant["color"],
                "size": variant["size"],
                "quantity": 1,
                "sku": variant["sku"],
            }],
            "payment_method": "cod",
            "notes": "test order",
            "use_loyalty_points": 0,
        }
        r = user_client.post(f"{base_url}/api/orders", json=order_payload)
        assert r.status_code == 200, r.text
        order = r.json()
        assert order["payment_method"] == "cod"
        assert order["delivery_fee"] == 30.0
        assert order["subtotal"] == product["price"]
        assert order["total_amount"] == product["price"] + 30.0
        assert order["order_number"].startswith("WF")

        # verify listing works
        list_r = user_client.get(f"{base_url}/api/orders")
        assert list_r.status_code == 200
        order_ids = [o["id"] for o in list_r.json()]
        assert order["id"] in order_ids

        # verify get by id
        r2 = user_client.get(f"{base_url}/api/orders/{order['id']}")
        assert r2.status_code == 200
        assert r2.json()["id"] == order["id"]

    def test_order_without_auth(self, api_client, base_url):
        r = api_client.post(f"{base_url}/api/orders", json={})
        assert r.status_code in (401, 422)


# ---------------- Loyalty ----------------
class TestLoyalty:
    def test_get_loyalty_transactions(self, user_client, base_url):
        r = user_client.get(f"{base_url}/api/loyalty/transactions")
        assert r.status_code == 200
        txns = r.json()
        assert isinstance(txns, list)
        # welcome bonus should be present
        bonuses = [t for t in txns if t["transaction_type"] == "bonus"]
        assert bonuses, "welcome bonus transaction should exist"
        assert bonuses[0]["points"] == 50


# ---------------- Admin ----------------
class TestAdmin:
    def test_admin_stats(self, admin_client, base_url):
        r = admin_client.get(f"{base_url}/api/admin/stats")
        assert r.status_code == 200
        data = r.json()
        assert "total_products" in data
        assert "total_orders" in data
        assert "total_users" in data
        assert "total_revenue" in data
        assert "pending_orders" in data
        assert isinstance(data["total_products"], int)

    def test_admin_stats_forbidden_for_regular_user(self, user_client, base_url):
        r = user_client.get(f"{base_url}/api/admin/stats")
        assert r.status_code == 403

    def test_admin_can_list_all_orders(self, admin_client, base_url):
        r = admin_client.get(f"{base_url}/api/orders")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------------- Chat ----------------
class TestChat:
    def test_chat_endpoint_streams(self, base_url):
        # streaming SSE - just verify status 200 and some content
        session_id = f"TEST_chat_{uuid.uuid4().hex[:8]}"
        try:
            with requests.post(
                f"{base_url}/api/chat/message",
                params={"message": "مرحبا", "session_id": session_id},
                stream=True, timeout=45,
            ) as resp:
                assert resp.status_code == 200, resp.text
                chunks = []
                for i, chunk in enumerate(resp.iter_content(chunk_size=64, decode_unicode=True)):
                    if chunk:
                        chunks.append(chunk)
                    if i > 5:
                        break
                assert len(chunks) > 0, "should receive some streamed content"
        except requests.exceptions.Timeout:
            pytest.fail("Chat endpoint timed out")
