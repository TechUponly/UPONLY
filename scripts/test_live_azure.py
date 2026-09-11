import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base_url = "https://uponly-ai-os.azurewebsites.net"

print("========================================================")
print("🌐 TESTING LIVE AZURE PRODUCTION DEPLOYMENT")
print(f"URL: {base_url}")
print("========================================================")

# 1. Health Check
try:
    req = urllib.request.Request(f"{base_url}/health")
    with urllib.request.urlopen(req, context=ctx) as resp:
        data = json.loads(resp.read().decode())
        print(f"\n[✅ HEALTH CHECK] Status Code: {resp.status} | Data: {data}")
except Exception as e:
    print(f"\n[❌ HEALTH CHECK FAILED]: {e}")

# 2. Test Talent Acquisition - Python Developers in Navi Mumbai
try:
    payload = json.dumps({
        "agent_type": "recruiting",
        "payload": {"query": "Find Python developers in Navi Mumbai"}
    }).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/agents/execute", data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, context=ctx) as resp:
        data = json.loads(resp.read().decode())
        print("\n[✅ TALENT ACQUISITION QUERY]: 'Find Python developers in Navi Mumbai'")
        print("Response snippet:")
        content = data.get("execution_details", {}).get("content", str(data))
        for line in content.split("\n")[:10]:
            print("  ", line)
except Exception as e:
    print(f"\n[❌ TALENT QUERY FAILED]: {e}")

# 3. Test Greeting - "hi" to Sales Agent
try:
    payload = json.dumps({
        "agent_type": "sales",
        "payload": {"query": "hi"}
    }).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/agents/execute", data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, context=ctx) as resp:
        data = json.loads(resp.read().decode())
        print("\n[✅ GREETING QUERY]: 'hi' to Sales Agent")
        print("Response snippet:")
        content = data.get("execution_details", {}).get("content", str(data))
        for line in content.split("\n")[:6]:
            print("  ", line)
except Exception as e:
    print(f"\n[❌ GREETING QUERY FAILED]: {e}")

# 4. Test Candidate CV Download API
try:
    req = urllib.request.Request(f"{base_url}/api/download-cv/aravind_sharma_dev")
    with urllib.request.urlopen(req, context=ctx) as resp:
        content_disp = resp.headers.get("Content-Disposition")
        text = resp.read().decode()
        print(f"\n[✅ CV DOWNLOAD API]: Content-Disposition: {content_disp}")
        print("CV Snippet:")
        for line in text.split("\n")[:8]:
            print("  ", line)
except Exception as e:
    print(f"\n[❌ CV DOWNLOAD FAILED]: {e}")

print("\n========================================================")
print("🎉 AUDIT FINISHED")
print("========================================================")
