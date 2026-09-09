from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class WorkflowStep(BaseModel):
    step_id: str
    agent_name: str
    action_type: str
    params: Dict[str, Any] = {}
    depends_on: List[str] = []

class WorkflowDefinition(BaseModel):
    workflow_id: str
    name: str
    description: str
    steps: List[WorkflowStep]
