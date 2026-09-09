from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
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

# Enable CORS for browser access to dashboard
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

@app.get("/")
def root():
    return {
        "status": "online",
        "platform": settings.app_name,
        "version": settings.version,
        "docs_url": "/docs"
    }

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
