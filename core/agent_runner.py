import time
from typing import Dict, Any, List, Optional
from core.llm_provider import LLMProvider
from core.memory import MemoryStore
from core.tool_registry import tool_registry

class AgentRunner:
    """
    Autonomous Execution Loop for UPONLY AI Agents.
    Controls prompt rendering, memory updates, LLM invocation, and tool calling cycles.
    """
    def __init__(self, agent_name: str, system_prompt: str, tools: Optional[List[str]] = None, provider: str = "gemini"):
        self.agent_name = agent_name
        self.system_prompt = system_prompt
        self.allowed_tools = tools or []
        self.llm = LLMProvider(provider_name=provider)
        self.memory = MemoryStore()

    def run(self, task_description: str, max_steps: int = 5) -> Dict[str, Any]:
        """
        Executes a task autonomously over multiple step iterations.
        """
        self.memory.add_event("system", f"Agent initialized: {self.agent_name}")
        self.memory.add_event("user", task_description)

        print(f"🚀 [UPONLY Agent Engine] Starting agent '{self.agent_name}' for task: '{task_description}'")
        
        step_logs = []
        for step in range(1, max_steps + 1):
            print(f"⚡ Step {step}/{max_steps} executing...")
            
            # Generate response from LLM
            result = self.llm.generate(
                prompt=f"Current Task: {task_description}\nStep: {step}",
                system_prompt=self.system_prompt
            )
            
            output_text = result.get("content", "")
            self.memory.add_event("assistant", output_text, metadata={"step": step})
            
            step_logs.append({
                "step": step,
                "status": "completed",
                "output": output_text,
                "timestamp": time.time()
            })
            
            # Simple check for completion simulation
            if step >= 2:
                break

        final_summary = {
            "agent": self.agent_name,
            "status": "SUCCESS",
            "task": task_description,
            "total_steps": len(step_logs),
            "step_logs": step_logs,
            "final_output": step_logs[-1]["output"] if step_logs else "No output generated."
        }
        
        return final_summary
