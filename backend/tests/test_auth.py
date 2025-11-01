from fastapi.testclient import TestClient
from app.main import app
import pytest
from app.db import init_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    yield

def test_register_and_login():
    # Test registration
    register_data = {
        "email": "test@example.com",
        "password": "Test123",
        "first_name": "Test",
        "last_name": "User",
        "role": "patient"
    }
    
    response = client.post("/api/v1/auth/register", json=register_data)
    assert response.status_code == 200
    assert "email" in response.json()
    assert response.json()["email"] == register_data["email"]
    
    # Test login
    login_data = {
        "username": "test@example.com",
        "password": "Test123"
    }
    
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "token_type" in response.json()
    assert response.json()["token_type"] == "bearer"
    
    # Test protected endpoint with token
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == register_data["email"]