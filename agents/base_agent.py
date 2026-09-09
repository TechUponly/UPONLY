from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from core.agent_runner import AgentRunner

class BaseAgent(ABC):
    """
    Abstract Base Class for all UPONLY AI Autonomous Agents.
    """
    def __init__(self, name: str, role: str, system_prompt: str, tools: Optional[List[str]] = None):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.tools = tools or []
        self.runner = AgentRunner(
            agent_name=self.name,
            system_prompt=f"Role: {self.role}\n\n{self.system_prompt}",
            tools=self.tools
        )

    @abstractmethod
    def execute_task(self, task_input: Dict[str, Any]) -> Dict[str, Any]:
        """Subclasses must implement specific business logic execution."""
        pass
