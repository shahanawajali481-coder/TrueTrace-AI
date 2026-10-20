def test_register_and_login(client):
    # 1. Register new user
    register_payload = {
        "email": "analyst@truetrace.ai",
        "password": "SuperSecurePassword123!",
        "full_name": "Security Analyst"
    }
    res = client.post("/api/v1/auth/register", json=register_payload)
    assert res.status_code == 201, res.text
    data = res.json()
    assert "user" in data
    assert data["user"]["email"] == "analyst@truetrace.ai"
    assert "tokens" in data
    token = data["tokens"]["access_token"]
    assert token

    # 2. Prevent duplicate registration
    res_dup = client.post("/api/v1/auth/register", json=register_payload)
    assert res_dup.status_code == 409

    # 3. Login with correct password
    login_payload = {
        "email": "analyst@truetrace.ai",
        "password": "SuperSecurePassword123!"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    assert res_login.json()["tokens"]["access_token"]

    # 4. Login with wrong password
    res_bad = client.post("/api/v1/auth/login", json={
        "email": "analyst@truetrace.ai",
        "password": "WrongPassword!"
    })
    assert res_bad.status_code == 401

    # 5. Access protected /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["full_name"] == "Security Analyst"
