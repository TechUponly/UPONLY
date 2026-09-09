import time
from typing import Dict, Any

class WorkflowTrigger:
    """
    Handles inbound webhook triggers, scheduled crons, and manual workflow invocations.
    """
    @staticmethod
    def trigger_webhook(event_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "trigger_type": "webhook",
            "event": event_name,
            "timestamp": time.time(),
            "payload": payload
        }

    @staticmethod
    def trigger_schedule(cron_expression: str, workflow_id: str) -> Dict[str, Any]:
        return {
            "trigger_type": "schedule",
            "cron": cron_expression,
            "workflow_id": workflow_id,
            "timestamp": time.time()
        }
