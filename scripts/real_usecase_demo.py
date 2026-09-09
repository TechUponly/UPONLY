#!/usr/bin/env python3
"""
UPONLY Real-Use-Case Demonstration Script
Simulates an end-to-end Enterprise Business Automation Workflow orchestrated by Claude 3.5 Sonnet.
"""
import sys
import json
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from workflows.definitions import WorkflowDefinition, WorkflowStep
from workflows.engine import WorkflowEngine

def main():
    print("=" * 80)
    print("🚀 UPONLY AUTONOMOUS BUSINESS OS — REAL USE CASE DEMONSTRATION")
    print("   Powered by Anthropic Claude 3.5 Sonnet Engine")
    print("=" * 80)

    # Define an end-to-end Enterprise Product Launch & Expansion Workflow
    workflow_def = WorkflowDefinition(
        workflow_id="wf_enterprise_launch_2026",
        name="Q4 Enterprise Automation & Product Launch Campaign",
        description="Multi-agent orchestration handling executive strategy, finance auditing, marketing content, promo video production, talent recruiting, and sales outreach.",
        steps=[
            WorkflowStep(
                step_id="01_executive_directive",
                agent_name="business_head",
                params={"query": "Formulate Q4 product expansion roadmap & delegate operational targets across all business units."}
            ),
            WorkflowStep(
                step_id="02_financial_audit",
                agent_name="finance",
                params={"query": "Audit Q4 expansion budget, verify $125k MRR baseline, and approve $35k marketing allocation."}
            ),
            WorkflowStep(
                step_id="03_content_marketing",
                agent_name="content",
                params={"query": "Create multi-channel viral announcements for LinkedIn, X/Twitter, and Instagram."}
            ),
            WorkflowStep(
                step_id="04_video_promo",
                agent_name="video",
                params={"query": "Script & storyboard 30s cybernetic motion-graphics product promo video."}
            ),
            WorkflowStep(
                step_id="05_talent_sourcing",
                agent_name="recruiting",
                params={"query": "Source and screen top 3 Senior AI Distributed Systems Engineers."}
            ),
            WorkflowStep(
                step_id="06_sales_outreach",
                agent_name="sales",
                params={"query": "Qualify enterprise prospect 'Acme Global Corp' and generate customized B2B proposal."}
            ),
            WorkflowStep(
                step_id="07_risk_audit",
                agent_name="risk",
                params={"query": "Audit platform data security compliance and contract clauses for Acme Global Corp."}
            )
        ]
    )

    engine = WorkflowEngine()
    
    initial_context = {
        "company_name": "UPONLY Technologies",
        "target_quarter": "Q4 2026",
        "client_prospect": "Acme Global Corp"
    }

    # Execute Workflow DAG
    execution_result = engine.execute_workflow(workflow_def, initial_context)

    print("\n" + "=" * 80)
    print("📊 MULTI-AGENT EXECUTION SUMMARY & REAL-WORLD RESULTS")
    print("=" * 80)
    
    for step_id, res in execution_result["step_results"].items():
        print(f"\n🔹 [STEP: {step_id}] -> Agent: {res.get('agent')}")
        print(f"   Status: {res.get('status')}")
        
        # Display key structured output based on agent type
        if "financial_summary" in res:
            print(f"   💰 Financial Audit: {res['financial_summary']}")
        elif "social_posts" in res:
            print(f"   📲 Generated LinkedIn Copy: {res['social_posts']['linkedin']}")
        elif "script" in res:
            print(f"   🎬 Promo Video Script Hook: {res['script']['hook_0_5s']}")
        elif "shortlisted_candidates" in res:
            print(f"   🤝 Sourced Candidates: {len(res['shortlisted_candidates'])} candidates matched.")
        elif "outreach_draft" in res:
            print(f"   📈 B2B Proposal Draft: {res['outreach_draft'].splitlines()[0]}")
        elif "risk_score" in res:
            print(f"   🛡️ Risk Compliance Score: {res['risk_score']}")
        elif "executive_summary" in res:
            print(f"   👑 Executive Directive: {res['executive_summary']}")

    print("\n" + "=" * 80)
    print("✅ WORKFLOW EXECUTION COMPLETE — 100% OPERATIONAL READINESS")
    print("=" * 80)

if __name__ == "__main__":
    main()
