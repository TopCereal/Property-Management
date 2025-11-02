import requests
import sys

BASE = "http://127.0.0.1:8001"
TIMEOUT = 5

failures = []

def ok(condition, msg):
    if not condition:
        failures.append(msg)
        print("FAIL:", msg)
    else:
        print("PASS:", msg)

def test_properties():
    print("\n== Testing properties endpoints ==")
    # 1. initial list
    r = requests.get(f"{BASE}/properties/", timeout=TIMEOUT)
    ok(r.status_code == 200, f"GET /properties/ should return 200, got {r.status_code}")
    data = r.json()
    # API may return either a list or a dict with 'value' key
    if isinstance(data, dict) and 'value' in data:
        initial_list = data['value']
    elif isinstance(data, list):
        initial_list = data
    else:
        initial_list = []
    initial_count = len(initial_list)

    # 2. create
    payload = {
        "address": "100 Test Ave",
        "bedrooms": 2,
        "bathrooms": 1.5,
        "area": 800,
        "rent_amount": "900.00",
        "status": "vacant"
    }
    r = requests.post(f"{BASE}/properties/", json=payload, timeout=TIMEOUT)
    ok(r.status_code == 200, f"POST /properties/ should return 200, got {r.status_code}")
    created = r.json()
    ok('id' in created, "Created property should have an id")
    pid = created['id']

    # 3. list increased
    r = requests.get(f"{BASE}/properties/", timeout=TIMEOUT)
    ok(r.status_code == 200, "GET /properties/ after create returns 200")
    data2 = r.json()
    if isinstance(data2, dict) and 'value' in data2:
        new_list = data2['value']
    elif isinstance(data2, list):
        new_list = data2
    else:
        new_list = []
    new_count = len(new_list)
    ok(new_count == initial_count + 1, f"Property count should increase by 1 (was {initial_count}, now {new_count})")

    # 4. get by id
    r = requests.get(f"{BASE}/properties/{pid}", timeout=TIMEOUT)
    ok(r.status_code == 200, f"GET /properties/{pid} should return 200")

    # 5. put update
    update = payload.copy()
    update['rent_amount'] = "950.00"
    update['status'] = "rented"
    r = requests.put(f"{BASE}/properties/{pid}", json=update, timeout=TIMEOUT)
    ok(r.status_code == 200, f"PUT /properties/{pid} should return 200")
    updated = r.json()
    ok(updated.get('rent_amount') in ("950.00", 950.00), "PUT updated rent_amount")
    ok(updated.get('status') == "rented", "PUT updated status")

    # 6. patch
    r = requests.patch(f"{BASE}/properties/{pid}", json={"area": 850}, timeout=TIMEOUT)
    ok(r.status_code == 200, f"PATCH /properties/{pid} should return 200")
    patched = r.json()
    ok(patched.get('area') in (850, 850.0), "PATCH updated area")

    # 7. delete
    r = requests.delete(f"{BASE}/properties/{pid}", timeout=TIMEOUT)
    ok(r.status_code in (200, 204), f"DELETE /properties/{pid} should return 200 or 204, got {r.status_code}")

    # 8. get should 404
    r = requests.get(f"{BASE}/properties/{pid}", timeout=TIMEOUT)
    ok(r.status_code == 404, f"GET deleted /properties/{pid} should return 404 (got {r.status_code})")


def test_tenants():
    print("\n== Testing tenants endpoints ==")
    # 1. create tenant
    payload = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test.user+api@example.com",
        "phone": "555-0000",
        "status": "active"
    }
    r = requests.post(f"{BASE}/tenants/", json=payload, timeout=TIMEOUT)
    ok(r.status_code == 200, f"POST /tenants/ should return 200, got {r.status_code}")
    created = r.json()
    ok('id' in created, "Created tenant should have an id")
    tid = created['id']

    # 2. get tenant
    r = requests.get(f"{BASE}/tenants/{tid}", timeout=TIMEOUT)
    ok(r.status_code == 200, f"GET /tenants/{tid} should return 200")

    # 3. patch tenant
    r = requests.patch(f"{BASE}/tenants/{tid}", json={"status": "inactive"}, timeout=TIMEOUT)
    ok(r.status_code == 200, f"PATCH /tenants/{tid} should return 200")
    patched = r.json()
    ok(patched.get('status') == "inactive", "PATCH updated tenant status")

    # 4. delete tenant
    r = requests.delete(f"{BASE}/tenants/{tid}", timeout=TIMEOUT)
    ok(r.status_code in (200,204), f"DELETE /tenants/{tid} should return 200 or 204, got {r.status_code}")

    # 5. get should 404
    r = requests.get(f"{BASE}/tenants/{tid}", timeout=TIMEOUT)
    ok(r.status_code == 404, f"GET deleted /tenants/{tid} should return 404 (got {r.status_code})")


if __name__ == '__main__':
    try:
        test_properties()
    except Exception as e:
        print('Error during properties tests:', e)
        failures.append('exception_properties')

    try:
        test_tenants()
    except Exception as e:
        print('Error during tenants tests:', e)
        failures.append('exception_tenants')

    print('\n== Summary ==')
    if failures:
        print('FAILURES:', failures)
        sys.exit(1)
    else:
        print('All tests passed')
        sys.exit(0)
