from typing import Dict, Any
from agents.base_agent import BaseAgent

class SalesAgent(BaseAgent):
    """
    Autonomous Sales & Lead Automation Agent for UPONLY.
    Automates lead enrichment, outreach email composition, CRM deal updates, and deal scoring.
    """
    def __init__(self):
        super().__init__(
            name="UPONLY Sales Agent",
            role="Lead Qualification & Sales Outreach Specialist",
            system_prompt="Analyze prospective enterprise clients, qualify lead indicators, structure outreach campaigns, and update sales pipelines.",
            tools=["crm_connector", "email_connector"]
        )

    def execute_task(self, task_input: Dict[str, Any]) -> Dict[str, Any]:
        lead_name = task_input.get("lead_name", "Prospective Enterprise Client")
        company = task_input.get("company", "Global Corp")
        
        prompt = (
            f"Qualify lead '{lead_name}' from '{company}'. "
            f"Generate a customized high-converting B2B outreach email draft and suggest CRM stage placement."
        )
        
        execution_result = self.runner.run(task_description=prompt)
        
        return {
            "agent": self.name,
            "status": "COMPLETED",
            "lead_name": lead_name,
            "company": company,
            "outreach_draft": f"Subject: Transforming Operations at {company} with UPONLY AI Agents\n\nDear {lead_name},\n\nUPONLY autonomous agents can automate your end-to-end sales & workflow processes...",
            "recommended_crm_stage": "Qualified Lead / Proposal Sent",
            "execution_details": execution_result
        }
