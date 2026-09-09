#!/usr/bin/env python3
import sys
import argparse
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agents.sales_agent import SalesAgent
from agents.operations_agent import OperationsAgent
from agents.support_agent import SupportAgent
from agents.analytics_agent import AnalyticsAgent

def main():
    parser = argparse.ArgumentParser(description="UPONLY AI Agent CLI Runner")
    parser.add_argument("--agent", choices=["sales", "operations", "support", "analytics"], default="sales", help="Target AI agent")
    parser.add_argument("--task", type=str, default="Execute standard business process automation", help="Task description or query")
    parser.add_argument("--dry-run", action="store_true", help="Simulate execution without external API calls")

    args = parser.parse_args()

    agents_map = {
        "sales": SalesAgent(),
        "operations": OperationsAgent(),
        "support": SupportAgent(),
        "analytics": AnalyticsAgent()
    }

    target_agent = agents_map[args.agent]
    print(f"🤖 Selected Agent: {target_agent.name} ({target_agent.role})")
    
    result = target_agent.execute_task({"query": args.task, "lead_name": "Acme Lead", "company": "Acme Corp"})
    print("\n✅ Execution Result:")
    print("--------------------")
    print(f"Status: {result.get('status')}")
    print(f"Agent: {result.get('agent')}")
    print(f"Details: {result}")

if __name__ == "__main__":
    main()
