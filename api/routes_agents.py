from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
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

router = APIRouter(prefix="/agents", tags=["Agents"])

AGENTS_MAP = {
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

class AgentTaskRequest(BaseModel):
    agent_type: str  # sales, operations, support, analytics, finance, content, video, recruiting, analyst, risk, business_head
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
