import sys
import json
import urllib.request
import urllib.error
import time
import jwt
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"
API_URL = f"{BASE_URL}/api/v1"

def print_header(title):
    print("\n" + "=" * 65)
    print(f"  {title.upper()}")
    print("=" * 65)

def run_test(name, fn):
    try:
        t0 = time.time()
        result = fn()
        elapsed = (time.time() - t0) * 1000
        print(f" [PASS] {name:48} ({elapsed:.1f}ms)")
        return True, result
    except Exception as e:
        print(f"![FAIL] {name:48} Error: {str(e)[:120]}")
        return False, None

# 1. Health & Readiness Tests
def test_health():
    res = urllib.request.urlopen(f"{BASE_URL}/health")
    data = json.loads(res.read().decode())
    assert data["status"] == "ok"
    assert "version" in data
    return data

def test_ready():
    res = urllib.request.urlopen(f"{BASE_URL}/ready")
    data = json.loads(res.read().decode())
    assert data["ready"] is True
    return data

# 2. Complaints API Tests
def test_list_complaints():
    res = urllib.request.urlopen(f"{API_URL}/complaints?limit=10")
    data = json.loads(res.read().decode())
    assert isinstance(data, list)
    assert len(data) > 0
    assert "reference_id" in data[0]
    return len(data)

def test_filter_complaints_by_category():
    res = urllib.request.urlopen(f"{API_URL}/complaints?category=Roads%20and%20Infrastructure&limit=5")
    data = json.loads(res.read().decode())
    for item in data:
        assert item["category"] == "Roads and Infrastructure"
    return len(data)

def test_filter_complaints_by_priority():
    res = urllib.request.urlopen(f"{API_URL}/complaints?priority=Critical&limit=5")
    data = json.loads(res.read().decode())
    for item in data:
        assert item["priority"] == "Critical"
    return len(data)

def test_search_complaints():
    res = urllib.request.urlopen(f"{API_URL}/complaints?search=pothole&limit=5")
    data = json.loads(res.read().decode())
    assert isinstance(data, list)
    return len(data)

def test_create_complaint_and_ai_triage():
    payload = {
        "title": "Severe road crater near St. Johns Hospital gate",
        "description": "Ambulances facing severe delays due to deep waterfilled pothole outside emergency gate.",
        "category": "Roads and Infrastructure",
        "address": "Koramangala 100ft Road, Bengaluru",
        "ward": "Ward 151",
        "latitude": 12.9344,
        "longitude": 77.6192
    }
    req = urllib.request.Request(
        f"{API_URL}/complaints",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    assert data["status"] in ["Submitted", "Awaiting Review"]
    assert "reference_id" in data
    assert data["reference_id"].startswith("BLR-")
    assert "ai_assessment" in data
    assert data["ai_assessment"]["priority_recommendation"] in ["Critical", "High"]
    return data

def test_get_complaint_by_id(cid):
    res = urllib.request.urlopen(f"{API_URL}/complaints/{cid}")
    data = json.loads(res.read().decode())
    assert data["id"] == cid
    assert "timeline" in data
    return data

def test_track_complaint_by_reference(ref_id):
    res = urllib.request.urlopen(f"{API_URL}/complaints/ref/{ref_id}")
    data = json.loads(res.read().decode())
    assert data["reference_id"] == ref_id
    assert len(data["timeline"]) >= 1
    return data

def test_update_complaint_status(cid):
    payload = {"status": "In Progress", "internal_notes": "Inspection crew dispatched"}
    req = urllib.request.Request(
        f"{API_URL}/complaints/{cid}/status",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="PATCH"
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    assert data["status"] == "In Progress"
    return data

def test_assign_complaint(cid):
    payload = {
        "assigned_department_id": "Roads and Infrastructure",
        "assigned_officer_id": "Executive Engineer BBMP",
        "priority": "Critical"
    }
    req = urllib.request.Request(
        f"{API_URL}/complaints/{cid}/assign",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    assert data["assigned_department_id"] == "Roads and Infrastructure"
    return data

# 3. AI & Duplicate Services
def test_ai_analyze_endpoint():
    payload = {
        "title": "Exposed high voltage wire sparking near kindergarten",
        "description": "Wire dangling from broken streetlight pole on 5th cross right next to primary school.",
        "category": "Streetlights",
        "ward": "Ward 80"
    }
    req = urllib.request.Request(
        f"{API_URL}/ai/analyze",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    assert data["priority_recommendation"] == "Critical"
    assert len(data["risk_factors"]) > 0
    assert len(data["priority_reasoning"]) > 0
    return data

def test_duplicate_detection_endpoint():
    payload = {
        "title": "Deep pothole on 100ft road",
        "description": "Very big crater in middle of road near signal",
        "category": "Roads and Infrastructure",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    req = urllib.request.Request(
        f"{API_URL}/ai/check-duplicates",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    assert "is_potential_duplicate" in data
    assert "matches" in data
    return data

def test_interactive_chat_endpoint():
    payload = {"message": "How do I file a grievance for broken streetlights?"}
    req = urllib.request.Request(
        f"{API_URL}/ai/chat",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    assert "reply" in data
    assert len(data["reply"]) > 10
    assert data.get("action") is not None
    return data

# 4. Hotspots (Pure-Python DBSCAN) & Analytics
def test_hotspots_service():
    res = urllib.request.urlopen(f"{API_URL}/hotspots")
    data = json.loads(res.read().decode())
    assert isinstance(data, list)
    if len(data) > 0:
        h = data[0]
        assert "hotspot_id" in h
        assert "complaint_count" in h
        assert "severity" in h
        assert "center_latitude" in h
        assert "center_longitude" in h
        assert "dominant_category" in h
    return len(data)

def test_analytics_summary():
    res = urllib.request.urlopen(f"{API_URL}/analytics/summary")
    data = json.loads(res.read().decode())
    assert "total_complaints" in data
    assert "category_distribution" in data
    assert "priority_distribution" in data
    assert data["total_complaints"] > 0
    return data

def test_officers_directory():
    res = urllib.request.urlopen(f"{API_URL}/admin/officers")
    data = json.loads(res.read().decode())
    assert isinstance(data, list)
    assert len(data) > 0
    return len(data)

def test_datasets_catalog():
    res = urllib.request.urlopen(f"{API_URL}/datasets")
    data = json.loads(res.read().decode())
    assert isinstance(data, list)
    assert len(data) >= 4
    for ds in data:
        assert "name" in ds
        assert "record_count" in ds
        assert "validation_status" in ds
    return len(data)

# 5. Security & Authentication Tests
def test_jwt_valid_citizen_token(secret):
    from datetime import timezone
    payload = {
        "sub": "test-citizen-uuid-99",
        "email": "test.citizen@bengaluru.gov.in",
        "role": "citizen",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    from app.core.security import decode_token
    decoded = decode_token(token)
    assert decoded["sub"] == "test-citizen-uuid-99"
    assert decoded["role"] == "citizen"
    return decoded

def test_jwt_valid_admin_token(secret):
    from datetime import timezone
    payload = {
        "sub": "bbmp-commissioner-uuid",
        "email": "commissioner@bbmp.gov.in",
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    from app.core.security import decode_token
    decoded = decode_token(token)
    assert decoded["role"] == "admin"
    return decoded

def test_jwt_expired_token_rejection(secret):
    from datetime import timezone
    payload = {
        "sub": "expired-user",
        "role": "citizen",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=10) # Expired
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    from app.core.security import decode_token
    from fastapi import HTTPException
    try:
        decode_token(token)
        raise AssertionError("Expired token was not rejected!")
    except HTTPException as e:
        assert e.status_code == 401
        assert "expired" in str(e.detail).lower()
        return "Expired token rejected correctly"

def test_jwt_tampered_token_rejection(secret):
    payload = {"sub": "hacker", "role": "admin"}
    token = jwt.encode(payload, "wrong_secret_12345", algorithm="HS256")
    from app.core.security import decode_token
    from fastapi import HTTPException
    try:
        decode_token(token)
        raise AssertionError("Tampered token was not rejected!")
    except HTTPException as e:
        assert e.status_code == 401
        assert "invalid" in str(e.detail).lower()
        return "Tampered token rejected correctly"

def test_role_enforcement():
    from app.core.security import require_role
    from fastapi import HTTPException
    checker = require_role(["admin", "officer"])
    # Citizen user trying to access admin endpoint
    citizen_user = {"sub": "cit-1", "role": "citizen"}
    try:
        checker(current_user=citizen_user)
        raise AssertionError("Citizen was not blocked from admin resource!")
    except HTTPException as e:
        assert e.status_code == 403
        assert "access denied" in str(e.detail).lower()
    
    # Admin user accessing admin endpoint
    admin_user = {"sub": "adm-1", "role": "admin"}
    res = checker(current_user=admin_user)
    assert res["role"] == "admin"
    return "Role-based authorization working"

def test_pii_protection():
    # Verify public complaint list does not expose citizen contact phone / email
    res = urllib.request.urlopen(f"{API_URL}/complaints?limit=10")
    data = json.loads(res.read().decode())
    for item in data:
        assert "phone" not in item
        assert "citizen_phone" not in item
        assert "citizen_email" not in item
    return "Zero citizen PII exposed on public endpoints"

def test_not_found_handling():
    try:
        urllib.request.urlopen(f"{API_URL}/complaints/invalid-uuid-999999")
        raise AssertionError("Did not return 404 for invalid ID")
    except urllib.error.HTTPError as e:
        assert e.code == 404
        return "Proper 404 returned for missing resources"

# Run Master Suite
if __name__ == "__main__":
    from app.core.config import settings
    secret = settings.JWT_SECRET or settings.SUPABASE_ANON_KEY

    total = 0
    passed = 0

    print_header("1. Core Infrastructure & Health Tests")
    t, _ = run_test("GET /health status and version", test_health)
    passed += t; total += 1
    t, _ = run_test("GET /ready system readiness", test_ready)
    passed += t; total += 1

    print_header("2. Complaints Lifecycle & State Machine")
    t, _ = run_test("GET /complaints paginated list", test_list_complaints)
    passed += t; total += 1
    t, _ = run_test("GET /complaints filtered by category", test_filter_complaints_by_category)
    passed += t; total += 1
    t, _ = run_test("GET /complaints filtered by priority", test_filter_complaints_by_priority)
    passed += t; total += 1
    t, _ = run_test("GET /complaints fulltext search", test_search_complaints)
    passed += t; total += 1
    t, new_comp = run_test("POST /complaints + Auto AI Triage", test_create_complaint_and_ai_triage)
    passed += t; total += 1

    cid = new_comp["id"] if new_comp else "non-existent"
    ref_id = new_comp["reference_id"] if new_comp else "non-existent"

    t, _ = run_test("GET /complaints/{id} details & timeline", lambda: test_get_complaint_by_id(cid))
    passed += t; total += 1
    t, _ = run_test("GET /complaints/ref/{ref} citizen tracking", lambda: test_track_complaint_by_reference(ref_id))
    passed += t; total += 1
    t, _ = run_test("PATCH /complaints/{id}/status transition", lambda: test_update_complaint_status(cid))
    passed += t; total += 1
    t, _ = run_test("POST /complaints/{id}/assign dispatch", lambda: test_assign_complaint(cid))
    passed += t; total += 1

    print_header("3. AI Intelligence & Civic Bot")
    t, _ = run_test("POST /ai/analyze Gemini auto-triage", test_ai_analyze_endpoint)
    passed += t; total += 1
    t, _ = run_test("POST /ai/check-duplicates 300m spatial match", test_duplicate_detection_endpoint)
    passed += t; total += 1
    t, _ = run_test("POST /ai/chat interactive citizen assistant", test_interactive_chat_endpoint)
    passed += t; total += 1

    print_header("4. Spatial DBSCAN, Analytics & Administration")
    t, _ = run_test("GET /hotspots pure-Python Haversine DBSCAN", test_hotspots_service)
    passed += t; total += 1
    t, _ = run_test("GET /analytics/summary KPI aggregations", test_analytics_summary)
    passed += t; total += 1
    t, _ = run_test("GET /admin/officers 1009 BBMP staff", test_officers_directory)
    passed += t; total += 1
    t, _ = run_test("GET /datasets provenance data catalog", test_datasets_catalog)
    passed += t; total += 1

    print_header("5. Security, Auth, RBAC & Data Protection")
    t, _ = run_test("JWT citizen token decode (HS256)", lambda: test_jwt_valid_citizen_token(secret))
    passed += t; total += 1
    t, _ = run_test("JWT admin token decode (HS256)", lambda: test_jwt_valid_admin_token(secret))
    passed += t; total += 1
    t, _ = run_test("Expired JWT cryptographic rejection", lambda: test_jwt_expired_token_rejection(secret))
    passed += t; total += 1
    t, _ = run_test("Tampered secret signature rejection", lambda: test_jwt_tampered_token_rejection(secret))
    passed += t; total += 1
    t, _ = run_test("RBAC role checker (citizen vs admin)", test_role_enforcement)
    passed += t; total += 1
    t, _ = run_test("PII data masking on public endpoints", test_pii_protection)
    passed += t; total += 1
    t, _ = run_test("404 error envelope for missing items", test_not_found_handling)
    passed += t; total += 1

    print_header("Master Test Suite Execution Result")
    pct = (passed / total) * 100
    print(f"\n  TOTAL TESTS : {total}")
    print(f"  PASSED      : {passed}")
    print(f"  FAILED      : {total - passed}")
    print(f"  PASS RATE   : {pct:.1f}%\n")
    if passed == total:
        print("  >>> ALL TEST SECTIONS PASSED WITH 100% SUCCESS <<<\n")
        sys.exit(0)
    else:
        print("  >>> FAILURES DETECTED IN TEST SUITE <<<\n")
        sys.exit(1)
