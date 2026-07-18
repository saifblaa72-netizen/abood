import os
import pytest
import requests
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.strip().split("=", 1)[1].strip().strip('"').rstrip("/")
                    break
    except Exception:
        pass


@pytest.fixture(scope="session")
def base_url():
    assert BASE_URL, "REACT_APP_BACKEND_URL not set"
    return BASE_URL


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "admin@waheebafashion.com", "password": "admin123"},
        timeout=15,
    )
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture(scope="session")
def test_user():
    email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": email,
        "full_name": "TEST User",
        "phone": "0501234567",
        "password": "test1234",
    }
    r = requests.post(f"{BASE_URL}/api/auth/register", json=payload, timeout=15)
    if r.status_code != 200:
        pytest.skip(f"User registration failed: {r.status_code} {r.text}")
    data = r.json()
    return {"token": data["token"], "user": data["user"], "password": "test1234"}


@pytest.fixture
def admin_client(admin_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"})
    return s


@pytest.fixture
def user_client(test_user):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {test_user['token']}"})
    return s
