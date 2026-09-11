import sys
from pathlib import Path

# Add UPONLY root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.llm_provider import LLMProvider

llm = LLMProvider()

test_cases = [
    {
        "agent": "Talent Acquisition",
        "role": "Chief Talent Acquisition & HR AI Partner",
        "prompts": [
            "hello",
            "Find Python developers in Navi Mumbai",
            "Find B2B sales leads in London",
            "what can you do?"
        ]
    },
    {
        "agent": "Sales",
        "role": "VP of B2B Sales & Lead Generation",
        "prompts": [
            "hi",
            "Qualify healthcare SaaS leads in US",
            "Draft cold outreach email for CFOs"
        ]
    },
    {
        "agent": "Video Creator",
        "role": "Multimedia & Video Production Director",
        "prompts": [
            "greetings",
            "Create a 30 second promo script for UPONLY OS"
        ]
    }
]

print("========================================================")
print("🧪 TESTING DYNAMIC AI RESPONSES FOR VARIOUS PROMPTS")
print("========================================================")

for test in test_cases:
    agent_name = test["agent"]
    role = test["role"]
    print(f"\n--- AGENT: {agent_name} ({role}) ---")
    for p in test["prompts"]:
        system_prompt = f"Role: {role}\nDirective: Execute task"
        res = llm.generate(prompt=f"Task Directive: {p}", system_prompt=system_prompt)
        print(f"\n>>> USER PROMPT: '{p}'")
        print(">>> AI RESPONSE SNIPPET:")
        lines = res["content"].split("\n")
        print("\n".join(lines[:6]))

print("\n========================================================")
print("✅ DYNAMIC TEST COMPLETED")
print("========================================================")
