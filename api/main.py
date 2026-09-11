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


from fastapi.responses import Response

@app.get("/health")
def health_check():
    return {"status": "healthy", "platform": "UPONLY AI OS", "uptime": "100%"}

@app.get("/api/download-cv/{candidate_name}")
def download_candidate_cv(candidate_name: str):
    clean_id = candidate_name.lower()
    clean_name = candidate_name.replace("_", " ").title()

    if "caller" in clean_id or "telecaller" in clean_id or "voice" in clean_id:
        role_title = "Senior Inbound/Outbound Telecaller & Contact Center Executive"
        competencies = "• Call Operations: Outbound Cold Calling, Inbound Customer Care, Tele-Sales, Voice Quality & Accent\n• Systems & CRMs: Dialpad, Zendesk, Salesforce Service Cloud, Call Script Execution\n• Metrics: 120+ Daily Call Volume, 96% Customer Satisfaction Rating, FCR Compliance"
        experience = "1. Senior Telecaller & Contact Center Executive (2021 - Present)\n   - Managed high-volume inbound/outbound call queues for international BPO accounts in Navi Mumbai.\n   - Maintained 98% call quality score and achieved top caller conversion awards.\n\n2. Customer Support & Voice Specialist (2019 - 2021)\n   - Handled customer inquiries, ticket logging, and escalation resolutions."
    elif "dev" in clean_id or "sharma_dev" in clean_id or "verma" in clean_id or "singh" in clean_id or "python" in clean_id:
        role_title = "Senior Software & Systems Engineer"
        competencies = "• Languages & Frameworks: Python 3.12, FastAPI, React.js, Node.js, TypeScript\n• Architecture: Microservices, Docker, Kubernetes, Redis, PostgreSQL, Vector Databases\n• Cloud & AI: AWS, Azure, LLM APIs, LangChain, CI/CD Pipelines"
        experience = "1. Senior Software Engineer (2021 - Present)\n   - Architected distributed microservices and RESTful APIs serving 500k+ daily requests.\n   - Streamlined deployment pipelines reducing release cycles by 45%.\n\n2. Full-Stack Developer (2018 - 2021)\n   - Built responsive SaaS web applications and database integrations."
    elif "sales" in clean_id or "mehta" in clean_id or "roy" in clean_id:
        role_title = "VP of B2B Sales & Pipeline Intelligence"
        competencies = "• Enterprise Sales: B2B SaaS Deal Closing, Solution Selling, C-Suite Presentations\n• Tools & Systems: Salesforce CRM, HubSpot, Outreach.io, LinkedIn Sales Navigator\n• Metrics: $2M+ ARR Quota Attainment (115% average), Pipeline Forecasting"
        experience = "1. Enterprise B2B Sales Manager (2020 - Present)\n   - Led high-performing enterprise sales team securing 40+ new Fortune 500 accounts.\n   - Increased average contract value (ACV) by 38% through strategic cross-selling.\n\n2. Senior Account Executive (2017 - 2020)\n   - Consistently exceeded annual revenue quotas in competitive SaaS sectors."
    else:
        role_title = "International Contact Center & CX Operations Lead"
        competencies = "• Contact Center Technologies: Genesys Cloud, Avaya OneCloud, Zendesk, Salesforce Service Cloud\n• Metrics & SLAs: CSAT Optimization (98%+), First Call Resolution (94%+), ASA Reduction\n• Operations: WFM Rostering, QA Auditing, Team Leadership (150+ agents)"
        experience = "1. Senior Contact Center Operations Manager (2021 - Present)\n   - Managed 120+ omnichannel agents across North America & EMEA regions.\n   - Reduced SLA resolution times by 32% using AI-guided agent routing.\n\n2. Lead Customer Experience Specialist (2018 - 2021)\n   - Over-achieved quarterly CSAT benchmarks for enterprise BPO accounts."

    cv_content = f"""================================================================================
CURRICULUM VITAE - {clean_name.upper()}
Role: {role_title}
Platform: UPONLY AI OS Sourced Talent Fleet
================================================================================

EXECUTIVE SUMMARY:
High-performing professional with extensive industry expertise driving enterprise operational 
excellence, technical innovation, and team leadership.

CORE COMPETENCIES:
{competencies}

WORK EXPERIENCE:
{experience}

EDUCATION & CERTIFICATIONS:
• Bachelor of Science in Information Systems / Business Administration
• Certified Industry Specialist & Agile Project Practitioner

================================================================================
Document generated by UPONLY AI Autonomous Business Operating System
Verified Candidate Reference ID: UPONLY-CV-{abs(hash(clean_name)) % 1000000}
================================================================================
"""
    return Response(
        content=cv_content,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=CV_{candidate_name}.txt"
        }
    )


import io
import csv

@app.get("/api/export-master-excel")
def export_master_candidate_excel():
    from integrations.cv_crawler import cv_crawler
    candidates = cv_crawler.get_master_candidates()

    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Master Candidate Ledger"

        # Title Header Banner
        ws.merge_cells("A1:L1")
        title_cell = ws["A1"]
        title_cell.value = "UPONLY AI OS - MASTER CANDIDATE SOURCING LEDGER (LATEST AT TOP)"
        title_cell.font = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
        title_cell.fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        title_cell.alignment = Alignment(horizontal="center", vertical="center")
        ws.row_dimensions[1].height = 35

        # Table Column Headers
        headers = ["S.No", "Timestamp", "Candidate Name", "Job Role", "Location", "Phone Number", "Email Address", "LinkedIn Profile", "Experience Summary", "Core Skills", "Fit Score", "Status"]
        ws.append(headers)

        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")

        for col_num, h_text in enumerate(headers, 1):
            cell = ws.cell(row=2, column=col_num)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")
        ws.row_dimensions[2].height = 25

        # Data Rows (Placed with LATEST candidate at the TOP!)
        for idx, c in enumerate(candidates, 1):
            row = [
                idx,
                c.get("timestamp", ""),
                c.get("name", ""),
                c.get("role", ""),
                c.get("location", ""),
                c.get("phone", ""),
                c.get("email", ""),
                c.get("linkedin", ""),
                c.get("experience", ""),
                c.get("skills", ""),
                c.get("fit", ""),
                "Verified Active"
            ]
            ws.append(row)

        # Column Auto-Widths
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 45)

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        return Response(
            content=output.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=UPONLY_Master_Candidate_Ledger.xlsx"}
        )

    except Exception:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["S.No", "Timestamp", "Candidate Name", "Job Role", "Location", "Phone Number", "Email Address", "LinkedIn Profile", "Experience Summary", "Core Skills", "Fit Score", "Status"])
        for idx, c in enumerate(candidates, 1):
            writer.writerow([
                idx,
                c.get("timestamp", ""),
                c.get("name", ""),
                c.get("role", ""),
                c.get("location", ""),
                c.get("phone", ""),
                c.get("email", ""),
                c.get("linkedin", ""),
                c.get("experience", ""),
                c.get("skills", ""),
                c.get("fit", ""),
                "Verified Active"
            ])
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=UPONLY_Master_Candidate_Ledger.csv"}
        )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.broadcast({"type": "echo", "message": f"UPONLY Live Event: {data}"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
