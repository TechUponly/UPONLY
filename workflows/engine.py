import time
from typing import Dict, Any, List
from workflows.definitions import WorkflowDefinition
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

class WorkflowEngine:
    """
    Executes multi-step business automation workflows using UPONLY specialized agents.
    """
    def __init__(self):
        self.agent_map = {
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

    def execute_workflow(self, workflow: WorkflowDefinition, initial_input: Dict[str, Any]) -> Dict[str, Any]:
        print(f"⚙️ [UPONLY Workflow Engine] Executing Workflow '{workflow.name}' ({workflow.workflow_id})")
        
        results = {}
        for step in workflow.steps:
            agent_key = step.agent_name.lower()
            agent = self.agent_map.get(agent_key)
            
            if not agent:
                results[step.step_id] = {"status": "FAILED", "reason": f"Agent {step.agent_name} not found."}
                continue

            print(f"▶️ Executing Step '{step.step_id}' with Agent '{agent.name}'...")
            combined_params = {**initial_input, **step.params}
            step_result = agent.execute_task(combined_params)
            results[step.step_id] = step_result

        return {
            "workflow_id": workflow.workflow_id,
            "name": workflow.name,
            "status": "COMPLETED",
            "timestamp": time.time(),
            "step_results": results
        }
