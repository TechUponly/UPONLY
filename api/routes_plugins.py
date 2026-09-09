from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.plugin_registry import plugin_registry

router = APIRouter(prefix="/plugins", tags=["Plugins"])

class PluginToggleRequest(BaseModel):
    plugin_id: str

@router.get("/")
def list_plugins():
    return {"plugins": plugin_registry.list_plugins()}

@router.post("/toggle")
def toggle_plugin(request: PluginToggleRequest):
    try:
        updated = plugin_registry.toggle_plugin(request.plugin_id)
        return {"status": "success", "plugin": updated}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
