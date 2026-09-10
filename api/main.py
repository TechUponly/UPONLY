import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from config.settings import settings
from api.routes_agents import router as agents_router
from api.routes_workflows import router as workflows_router
from api.routes_plugins import router as plugins_router
from api.routes_auth import router as auth_router
from api.websocket_server import ws_manager

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="UPONLY Business Automation & Autonomous AI Agent Engine API"
)

# Enable CORS for browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(agents_router)
app.include_router(workflows_router)
app.include_router(plugins_router)
app.include_router(auth_router)

# Mount Dashboard Static UI Directory for single-port unified deployment
dashboard_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dashboard")

@app.get("/")
def root():
    index_path = os.path.join(dashboard_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})
    return {
        "status": "online",
        "platform": settings.app_name,
        "version": settings.version,
        "docs_url": "/docs"
    }

@app.get("/app.js")
def get_app_js():
    return FileResponse(os.path.join(dashboard_dir, "app.js"), headers={"Cache-Control": "no-cache, no-store, must-revalidate"})

@app.get("/style.css")
def get_style_css():
    return FileResponse(os.path.join(dashboard_dir, "style.css"), headers={"Cache-Control": "no-cache, no-store, must-revalidate"})


@app.get("/health")
def health_check():
    return {"status": "healthy", "platform": "UPONLY AI OS", "uptime": "100%"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.broadcast({"type": "echo", "message": f"UPONLY Live Event: {data}"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
