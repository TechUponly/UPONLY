import time
from typing import List, Dict, Any, Optional

class MemoryStore:
    """
    Stores agent execution history, context messages, and persistent task state.
    """
    def __init__(self):
        self.history: List[Dict[str, Any]] = []
        self.context: Dict[str, Any] = {}

    def add_event(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        event = {
            "timestamp": time.time(),
            "role": role,
            "content": content,
            "metadata": metadata or {}
        }
        self.history.append(event)

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.history[-limit:]

    def clear(self):
        self.history.clear()
        self.context.clear()
