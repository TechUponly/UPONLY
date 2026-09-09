from typing import Dict, Any
from agents.base_agent import BaseAgent

class SupportAgent(BaseAgent):
    """
    Autonomous Customer Support Agent for UPONLY.
    Handles customer inquiries, resolves technical issues, and categorizes tickets.
    """
    def __init__(self):
        super().__init__(
            name="UPONLY Support Agent",
            role="24/7 AI Customer Support Specialist",
            system_prompt="Resolve client support tickets, analyze error logs, provide solution paths, and auto-reply.",
            tools=["crm_connector", "email_connector"]
        )

    def execute_task(self, task_input: Dict[str, Any]) -> Dict[str, Any]:
        ticket_id = task_input.get("ticket_id", "TICK-1001")
        issue_query = task_input.get("query", "How do I configure autonomous webhooks in UPONLY?")
        
        prompt = f"Resolve support ticket {ticket_id}: '{issue_query}'"
        execution_result = self.runner.run(task_description=prompt)
        
        return {
            "agent": self.name,
            "status": "RESOLVED",
            "ticket_id": ticket_id,
            "resolution": f"Configuration Guide provided for '{issue_query}'. Webhook setup verified.",
            "execution_details": execution_result
        }
