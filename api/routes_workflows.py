from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List
from workflows.definitions import WorkflowDefinition, WorkflowStep
from workflows.engine import WorkflowEngine

router = APIRouter(prefix="/workflows", tags=["Workflows"])
engine = WorkflowEngine()

class WorkflowExecutionRequest(BaseModel):
    name: str
    steps: List[Dict[str, Any]]
    initial_input: Dict[str, Any]

@router.post("/run")
def run_workflow(request: WorkflowExecutionRequest):
    steps = [
        WorkflowStep(
            step_id=f"step_{idx+1}",
            agent_name=step_data.get("agent", "operations"),
            params=step_data.get("params", {})
        )
        for idx, step_data in enumerate(request.steps)
    ]
    
    definition = WorkflowDefinition(
        workflow_id="wf_custom_001",
        name=request.name,
        description="Custom API trigger workflow",
        steps=steps
    )
    
    result = engine.execute_workflow(definition, request.initial_input)
    return result
