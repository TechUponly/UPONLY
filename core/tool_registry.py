from typing import Callable, Dict, Any, List

class ToolRegistry:
    """
    Registry for dynamic tool discovery and execution by UPONLY agents.
    """
    def __init__(self):
        self._tools: Dict[str, Dict[str, Any]] = {}

    def register(self, name: str, description: str, func: Callable):
        self._tools[name] = {
            "name": name,
            "description": description,
            "func": func
        }

    def execute(self, tool_name: str, **kwargs) -> Any:
        if tool_name not in self._tools:
            raise ValueError(f"Tool '{tool_name}' is not registered in UPONLY Tool Registry.")
        tool = self._tools[tool_name]
        return tool["func"](**kwargs)

    def list_tools(self) -> List[Dict[str, str]]:
        return [
            {"name": name, "description": tool["description"]}
            for name, tool in self._tools.items()
        ]

# Global tool registry instance
tool_registry = ToolRegistry()
