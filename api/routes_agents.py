from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from agents.base_agent import BaseAgent
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

class CustomDynamicAgent(BaseAgent):
    """Dynamic custom agent instantiated at runtime."""
    def __init__(self, agent_id: str, name: str, role: str, system_prompt: str, tools: Optional[List[str]] = None):
        super().__init__(name=name, role=role, system_prompt=system_prompt, tools=tools or ["webhook_connector"])
        self.agent_id = agent_id

    def execute_task(self, task_input: Dict[str, Any]) -> Dict[str, Any]:
        query = task_input.get("query", f"Execute custom directive for {self.name}")
        execution_result = self.runner.run(task_description=f"Task: {query}")
        return {
            "agent": self.name,
            "status": "COMPLETED",
            "task": query,
            "execution_details": execution_result
        }

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
    agent_type: str
    payload: Dict[str, Any]

class CreateAgentRequest(BaseModel):
    agent_id: str
    name: str
    role: str
    system_prompt: str
    icon: Optional[str] = "🤖"
    tools: Optional[List[str]] = []

@router.get("/")
def list_agents():
    return {
        "agents": [
            {"id": key, "name": agent.name, "role": agent.role, "tools": getattr(agent, "tools", [])}
            for key, agent in AGENTS_MAP.items()
        ]
    }

@router.post("/create")
def create_new_agent(request: CreateAgentRequest):
    agent_key = request.agent_id.lower().replace(" ", "_")
    if agent_key in AGENTS_MAP:
        raise HTTPException(status_code=400, detail=f"Agent ID '{agent_key}' already exists.")
    
    new_agent = CustomDynamicAgent(
        agent_id=agent_key,
        name=request.name,
        role=request.role,
        system_prompt=request.system_prompt,
        tools=request.tools
    )
    
    AGENTS_MAP[agent_key] = new_agent
    return {
        "status": "success",
        "message": f"Agent '{request.name}' successfully created and added to fleet.",
        "agent": {
            "id": agent_key,
            "name": request.name,
            "role": request.role,
            "icon": request.icon,
            "tools": request.tools
        }
    }

from fastapi.responses import StreamingResponse
import json
from core.llm_provider import LLMProvider
from core.memory import get_agent_memory

class AgentMemoryRequest(BaseModel):
    key: str
    value: Any

@router.get("/{agent_type}/memory")
def get_agent_memory_endpoint(agent_type: str):
    clean_type = agent_type.lower()
    if clean_type not in AGENTS_MAP:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_type}' not found.")
    mem = get_agent_memory(clean_type)
    return {
        "agent_id": clean_type,
        "context": mem.get_context(),
        "total_events": len(mem.get_history()),
        "history": mem.get_history(limit=50)
    }

@router.post("/{agent_type}/memory")
def update_agent_memory_endpoint(agent_type: str, request: AgentMemoryRequest):
    clean_type = agent_type.lower()
    if clean_type not in AGENTS_MAP:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_type}' not found.")
    mem = get_agent_memory(clean_type)
    mem.set_context(request.key, request.value)
    return {
        "status": "success",
        "agent_id": clean_type,
        "message": f"Memory context key '{request.key}' updated for agent '{clean_type}'.",
        "context": mem.get_context()
    }

@router.delete("/{agent_type}/memory")
def clear_agent_memory_endpoint(agent_type: str):
    clean_type = agent_type.lower()
    if clean_type not in AGENTS_MAP:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_type}' not found.")
    mem = get_agent_memory(clean_type)
    mem.clear()
    return {
        "status": "success",
        "agent_id": clean_type,
        "message": f"Persistent memory cleared for agent '{clean_type}'."
    }

@router.post("/execute")
def execute_agent_task(request: AgentTaskRequest):
    clean_type = request.agent_type.lower()
    agent = AGENTS_MAP.get(clean_type)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{request.agent_type}' not found.")
    
    query = request.payload.get("query", f"Execute directive for {agent.name}")
    mem = get_agent_memory(clean_type)
    mem.add_event(role="user", content=query)

    result = agent.execute_task(request.payload)
    
    final_output = result.get("execution_details", {}).get("content", str(result))
    mem.add_event(role="agent", content=final_output)

    return result

@router.post("/stream")
def stream_agent_task(request: AgentTaskRequest):
    clean_type = request.agent_type.lower()
    agent = AGENTS_MAP.get(clean_type)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{request.agent_type}' not found.")
    
    query = request.payload.get("query", f"Execute directive for {agent.name}")
    prompt = f"Task Directive: {query}"
    system_prompt = f"Role: {agent.role}\nDirective: {getattr(agent, 'system_prompt', 'Execute directive with peak reasoning.')}"

    mem = get_agent_memory(clean_type)
    mem.add_event(role="user", content=query)

    def event_generator():
        llm = LLMProvider()
        full_content = ""
        for chunk in llm.stream_generate(prompt, system_prompt):
            full_content += chunk
            yield f"data: {json.dumps({'token': chunk})}\n\n"
        
        mem.add_event(role="agent", content=full_content)
        yield f"data: {json.dumps({'status': 'COMPLETED'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

