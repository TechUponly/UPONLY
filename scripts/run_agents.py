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
from agents.finance_agent import FinanceAgent
from agents.content_agent import ContentAgent
from agents.video_agent import VideoAgent
from agents.recruiting_agent import RecruitingAgent
from agents.analyst_agent import AnalystAgent
from agents.risk_agent import RiskAgent
from agents.business_head_agent import BusinessHeadAgent

def main():
    parser = argparse.ArgumentParser(description="UPONLY AI Agent CLI Runner")
    parser.add_argument(
        "--agent",
        choices=[
            "sales", "operations", "support", "analytics",
            "finance", "content", "video", "recruiting",
            "analyst", "risk", "business_head"
        ],
        default="business_head",
        help="Target AI agent to execute"
    )
    parser.add_argument("--task", type=str, default="Execute standard business directive", help="Task description or query")

    args = parser.parse_args()

    agents_map = {
        "sales": SalesAgent(),
        "operations": OperationsAgent(),
        "support": SupportAgent(),
        "analytics": AnalyticsAgent(),
        "finance": FinanceAgent(),
        "content": ContentAgent(),
        "video": VideoAgent(),
        "recruiting": RecruitingAgent(),
        "analyst": AnalystAgent(),
        "risk": RiskAgent(),
        "business_head": BusinessHeadAgent()
    }

    target_agent = agents_map[args.agent]
    print(f"🤖 Selected Agent: {target_agent.name} ({target_agent.role})")
    
    result = target_agent.execute_task({"query": args.task, "lead_name": "Enterprise Client", "company": "Global Tech"})
    print("\n✅ Execution Result:")
    print("--------------------")
    print(f"Status: {result.get('status')}")
    print(f"Agent: {result.get('agent')}")
    print(f"Details: {result}")

if __name__ == "__main__":
    main()
