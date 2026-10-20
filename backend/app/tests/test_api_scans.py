def test_full_scan_lifecycle(client):
    # 1. Register & get auth token
    res = client.post("/api/v1/auth/register", json={
        "email": "tester@truetrace.ai",
        "password": "Password123!",
        "full_name": "Test Investigator"
    })
    token = res.json()["tokens"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Execute email scan
    email_scan_res = client.post("/api/v1/scans/email", headers=headers, json={
        "identifier": "attacker@10minutemail.com"
    })
    assert email_scan_res.status_code == 200
    scan_data = email_scan_res.json()
    assert scan_data["scan_type"] == "EMAIL"
    assert scan_data["risk_level"] in ("MEDIUM", "HIGH")
    assert len(scan_data["evidence"]) > 0
    scan_id = scan_data["scan_id"]

    # 3. List scans
    list_res = client.get("/api/v1/scans", headers=headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    # 4. Fetch scan by ID
    get_res = client.get(f"/api/v1/scans/{scan_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["scan_id"] == scan_id

    # 5. Export JSON
    json_res = client.get(f"/api/v1/scans/{scan_id}/export/json", headers=headers)
    assert json_res.status_code == 200
    assert "scan_id" in json_res.json()

    # 6. Export PDF
    pdf_res = client.get(f"/api/v1/scans/{scan_id}/export/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 500  # Non-trivial PDF size

    # 7. Check Dashboard stats (Real data check!)
    dash_res = client.get("/api/v1/dashboard/stats", headers=headers)
    assert dash_res.status_code == 200
    stats = dash_res.json()
    assert stats["total_scans"] >= 1
    assert stats["email_scans"] >= 1

    # 8. Share scan report
    share_res = client.post(f"/api/v1/scans/{scan_id}/share", headers=headers)
    assert share_res.status_code == 200
    share_token = share_res.json()["share_token"]
    assert share_token

    # 9. Access shared report anonymously with token
    public_res = client.get(f"/api/v1/scans/{scan_id}?share_token={share_token}")
    assert public_res.status_code == 200
    assert public_res.json()["scan_id"] == scan_id

    # 10. Revoke share
    revoke_res = client.delete(f"/api/v1/scans/{scan_id}/share", headers=headers)
    assert revoke_res.status_code == 200

    # 11. Delete scan
    del_res = client.delete(f"/api/v1/scans/{scan_id}", headers=headers)
    assert del_res.status_code == 200
