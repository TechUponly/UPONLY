import requests
import json
import sys

BASE_URL = "http://localhost:8000"

print("🔍 ========================================================")
print("🚀 STARTING UPONLY AI OS END-TO-END SYSTEM & API AUDIT")
print("========================================================\n")

results = []

def log_test(name, success, detail=""):
    status = "✅ PASSED" if success else "❌ FAILED"
    results.append((name, success, detail))
    print(f"[{status}] {name}")
    if detail:
        print(f"   └── {detail}")

# 1. Health & Root
try:
    r = requests.get(f"{BASE_URL}/health")
    log_test("System Health Check (/health)", r.status_code == 200, r.json())
except Exception as e:
    log_test("System Health Check (/health)", False, str(e))

# 2. Authentication Endpoints
try:
    # Test credentials endpoint
    r = requests.get(f"{BASE_URL}/auth/credentials")
    log_test("Get Active Credentials (/auth/credentials)", r.status_code == 200, r.json())

    # Test update credentials
    r = requests.post(f"{BASE_URL}/auth/credentials", json={"user_id": "uponly.in@gmail.com", "passcode": "SecretPass123!"})
    log_test("Update Credentials (/auth/credentials)", r.status_code == 200, r.json())

    # Test login with valid credentials
    r = requests.post(f"{BASE_URL}/auth/login", json={"user_id": "uponly.in@gmail.com", "passcode": "SecretPass123!"})
    log_test("Login with Valid Credentials (/auth/login)", r.status_code == 200, r.json())

    # Test login with WRONG credentials (MUST fail strictly with 401)
    r = requests.post(f"{BASE_URL}/auth/login", json={"user_id": "uponly.in@gmail.com", "passcode": "WrongPassword"})
    log_test("Login with Wrong Credentials (Strict Rejection Test)", r.status_code == 401, f"Status: {r.status_code} (Strict 401 Unauthorized Verified)")

    # Reset credentials back to default
    requests.post(f"{BASE_URL}/auth/credentials", json={"user_id": "uponly.in@gmail.com", "passcode": "passcode123"})

    # Test forgot passcode reset email
    r = requests.post(f"{BASE_URL}/auth/forgot-passcode", json={"email": "uponly.in@gmail.com"})
    log_test("Forgot Passcode Reset Email (/auth/forgot-passcode)", r.status_code == 200, r.json()["message"])

except Exception as e:
    log_test("Auth Integration Audit", False, str(e))

# 3. Agent Fleet Endpoints & Model Execution
try:
    r = requests.get(f"{BASE_URL}/agents")
    agents = r.json().get("agents", [])
    log_test("Fetch Agent Fleet Registry (/agents)", r.status_code == 200, f"Found {len(agents)} Active Agents")

    # Execute Business Head Agent via LLM Engine
    r = requests.post(f"{BASE_URL}/agents/execute", json={
        "agent_type": "business_head",
        "payload": {"query": "Provide executive summary for Q3 operational revenue."}
    })
    res_data = r.json()
    log_test("Execute Agent Task (/agents/execute)", r.status_code == 200, f"Agent: {res_data.get('agent')}, Status: {res_data.get('status')}")

    # Execute Real-Time Stream Test for Talent Acquisition (Recruiting Agent)
    r_stream = requests.post(f"{BASE_URL}/agents/stream", json={
        "agent_type": "recruiting",
        "payload": {"query": "Screen resumes for Senior AI Engineer position."}
    }, stream=True)
    stream_tokens = 0
    for chunk in r_stream.iter_lines():
        if chunk:
            stream_tokens += 1
    log_test("Real-Time Token Stream (/agents/stream)", r_stream.status_code == 200, f"Received {stream_tokens} stream chunks successfully")

    # Dynamic Agent Creation
    r = requests.post(f"{BASE_URL}/agents/create", json={
        "agent_id": "audit_spec",
        "name": "Custom Audit Specialist",
        "icon": "🛡️",
        "role": "Chief Enterprise Security & Compliance Auditor",
        "system_prompt": "Audit all enterprise workflows and ensure strict regulatory adherence."
    })
    log_test("Create Dynamic Custom Agent (/agents/create)", r.status_code == 200, f"Message: {r.json().get('message')}")

except Exception as e:
    log_test("Agent Fleet Integration Audit", False, str(e))


# 4. Workflows & DAG Orchestration
try:
    r = requests.post(f"{BASE_URL}/workflows/run", json={
        "name": "Content & Media Automation Pipeline",
        "steps": [
            {"agent": "content", "params": {"action": "draft_script"}},
            {"agent": "video", "params": {"action": "render_broll"}}
        ],
        "initial_input": {"topic": "Fintech Banking Upgrade"}
    })
    log_test("Execute DAG Workflow (/workflows/run)", r.status_code == 200, f"Status: {r.json().get('status')}")

except Exception as e:
    log_test("Workflow Orchestration Audit", False, str(e))

# 5. Plugin Architecture
try:
    r = requests.get(f"{BASE_URL}/plugins")
    plugins = r.json().get("plugins", {})
    log_test("Fetch 3rd Party Plugins (/plugins)", r.status_code == 200, f"Loaded {len(plugins)} Plugins")

    r = requests.post(f"{BASE_URL}/plugins/toggle", json={"plugin_id": "vector_memory"})
    log_test("Toggle Plugin (/plugins/toggle)", r.status_code == 200, f"Status: {r.json().get('status')}, Plugin: {r.json().get('plugin', {}).get('name')}")

except Exception as e:
    log_test("Plugin System Audit", False, str(e))

print("\n========================================================")
passed_count = sum(1 for _, success, _ in results if success)
total_count = len(results)
print(f"📊 FINAL AUDIT RESULT: {passed_count}/{total_count} AUDIT TESTS PASSED")
print("========================================================\n")

if passed_count < total_count:
    sys.exit(1)
