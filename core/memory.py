import os
import time
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

MEMORY_DIR = Path(__file__).resolve().parent.parent / "data" / "memory"
MEMORY_DIR.mkdir(parents=True, exist_ok=True)

class MemoryStore:
    """
    Unlimited Persistent Agent Memory Engine for UPONLY.
    Retains complete conversation logs, agent reasoning steps, uploaded attachments, 
    audio/video transcripts, and contextual state with zero truncation limits.
    """
    def __init__(self, memory_id: str = "global_fleet"):
        self.memory_id = memory_id.lower().replace(" ", "_")
        self.file_path = MEMORY_DIR / f"{self.memory_id}.json"
        self.history: List[Dict[str, Any]] = []
        self.context: Dict[str, Any] = {}
        self.attachments: List[Dict[str, Any]] = []
        self.load_from_disk()

    def load_from_disk(self):
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.history = data.get("history", [])
                    self.context = data.get("context", {})
                    self.attachments = data.get("attachments", [])
            except Exception:
                pass

    def save_to_disk(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump({
                    "memory_id": self.memory_id,
                    "updated_at": time.time(),
                    "total_events": len(self.history),
                    "context": self.context,
                    "attachments": self.attachments,
                    "history": self.history
                }, f, indent=2)
        except Exception:
            pass

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
        self.save_to_disk()

    def set_context(self, key: str, value: Any):
        self.context[key] = value
        self.save_to_disk()

    def get_context(self, key: Optional[str] = None) -> Any:
        if key is None:
            return self.context
        return self.context.get(key)

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
            "context": self.context,
            "history": self.history
        }, indent=2)

    def clear(self):
        self.history.clear()
        self.context.clear()
        self.attachments.clear()
        self.save_to_disk()

# Map of active agent memory stores
_agent_memories: Dict[str, MemoryStore] = {}

def get_agent_memory(agent_id: str) -> MemoryStore:
    clean_id = agent_id.lower().replace(" ", "_")
    if clean_id not in _agent_memories:
        _agent_memories[clean_id] = MemoryStore(memory_id=clean_id)
    return _agent_memories[clean_id]

# Global Unlimited Fleet Memory Store
global_fleet_memory = MemoryStore(memory_id="unlimited_corporate_fleet")
