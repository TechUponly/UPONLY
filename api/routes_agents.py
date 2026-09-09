from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from agents.sales_agent import SalesAgent
from agents.operations_agent import OperationsAgent
from agents.support_agent import SupportAgent
from agents.analytics_agent import AnalyticsAgent

router = APIRouter(prefix="/agents", tags=["Agents"])

AGENTS_MAP = {
    "sales": SalesAgent(),
    "operations": OperationsAgent(),
    "support": SupportAgent(),
    "analytics": AnalyticsAgent()
}

class AgentTaskRequest(BaseModel):
    agent_type: str  # sales, operations, support, analytics
    payload: Dict[str, Any]

@router.get("/")
def list_agents():
    return {
        "agents": [
            {"id": key, "name": agent.name, "role": agent.role, "tools": agent.tools}
            for key, agent in AGENTS_MAP.items()
        ]
    }

@router.post("/execute")
def execute_agent_task(request: AgentTaskRequest):
    agent = AGENTS_MAP.get(request.agent_type.lower())
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{request.agent_type}' not found.")
    
    result = agent.execute_task(request.payload)
    return result
