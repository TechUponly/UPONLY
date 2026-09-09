import time
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

class MemoryStore:
    """
    Unlimited Persistent Agent Memory Engine for UPONLY.
    Retains complete conversation logs, agent reasoning steps, uploaded attachments, 
    audio/video transcripts, and contextual state with zero truncation limits.
    """
    def __init__(self, memory_id: str = "global_fleet"):
        self.memory_id = memory_id
        self.history: List[Dict[str, Any]] = []
        self.context: Dict[str, Any] = {}
        self.attachments: List[Dict[str, Any]] = []

    def add_event(self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None, attachments: Optional[List[Dict[str, Any]]] = None):
        event = {
            "timestamp": time.time(),
            "role": role,
            "content": content,
            "metadata": metadata or {},
            "attachments": attachments or []
        }
        self.history.append(event)
        if attachments:
            self.attachments.extend(attachments)

    def get_history(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Returns full history. If limit is None, returns UNLIMITED history.
        """
        if limit is None:
            return self.history
        return self.history[-limit:]

    def get_all_attachments(self) -> List[Dict[str, Any]]:
        return self.attachments

    def export_memory_json(self) -> str:
        return json.dumps({
            "memory_id": self.memory_id,
            "total_events": len(self.history),
            "total_attachments": len(self.attachments),
            "history": self.history
        }, indent=2)

    def clear(self):
        self.history.clear()
        self.context.clear()
        self.attachments.clear()

# Global Unlimited Fleet Memory Store
global_fleet_memory = MemoryStore(memory_id="unlimited_corporate_fleet")
