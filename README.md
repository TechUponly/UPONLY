# UPONLY - Business Automation & AI Agent Platform

![UPONLY Platform](https://img.shields.io/badge/UPONLY-AI%20Agents-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=for-the-badge)

**UPONLY** is an enterprise autonomous business automation engine and AI agent orchestration framework. It empowers organizations to deploy multi-agent systems that autonomously handle sales, operations, customer support, data analytics, and workflow automation.

---

## 🌟 Key Features

- **Multi-Agent Orchestration**: Coordinate autonomous specialized agents (Sales, Operations, Support, Analytics).
- **Extensible Tool Registry**: Equip agents with custom tools, webhooks, and API integrations.
- **Workflow Automation Engine**: Define, trigger, and execute complex business workflows with conditional logic and retry policies.
- **Multi-Model LLM Abstraction**: Supports Google Gemini, OpenAI GPT-4, and Anthropic Claude.
- **Real-Time Monitoring Dashboard**: Live WebSocket feeds and web interface to inspect agent reasoning, tool calls, and execution metrics.
- **Enterprise Integrations**: Built-in connectors for GitHub, CRMs, Email, and HTTP Webhooks.

---

## 📂 Project Structure

```
UPONLY/
├── agents/              # Autonomous AI agent implementations
│   ├── base_agent.py    # Abstract agent foundation
│   ├── sales_agent.py   # Lead qualification & sales agent
│   ├── operations_agent.py # Workflow & process automation agent
│   ├── support_agent.py # Customer support agent
│   └── analytics_agent.py # Data & executive reporting agent
├── core/                # Core platform engine
│   ├── agent_runner.py  # Agent execution loop
│   ├── llm_provider.py  # Unified LLM provider interface
│   ├── memory.py        # Short/long-term agent memory
│   └── tool_registry.py # Dynamic tool registration & call router
├── workflows/           # Business process execution engine
│   ├── engine.py        # Workflow DAG execution
│   ├── definitions.py   # Workflow schemas
│   └── triggers.py      # Event & scheduled triggers
├── api/                 # FastAPI REST API & WebSocket server
│   ├── main.py          # Server entrypoint
│   ├── routes_agents.py # Agent API endpoints
│   └── websocket_server.py # Real-time event streaming
├── integrations/        # Connectors for external systems
│   ├── github_connector.py # GitHub repository automation
│   ├── crm_connector.py # CRM automation
│   ├── email_connector.py # Email automation
│   └── webhook_connector.py # General webhook integration
├── dashboard/           # Web monitoring dashboard
├── config/              # YAML & Environment configuration
└── scripts/             # CLI runners and deployment helpers
```

---

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone or navigate to directory
cd /Users/shamrai/Desktop/UPONLY

# Setup virtual environment & dependencies
python3 -m venv .venv
source .venv/bin/python
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
cp config/.env.example .env
# Edit .env to add your API keys (e.g. GEMINI_API_KEY, OPENAI_API_KEY)
```

### 3. Run the API & Dashboard

```bash
# Start API & WebSocket server
python3 -m uvicorn api.main:app --reload --port 8000
```

Open `dashboard/index.html` in your browser to view the real-time agent control panel.

### 4. Run Agents via CLI

```bash
python3 scripts/run_agents.py --agent sales --task "Qualify high-priority enterprise lead"
```

---

## 📦 GitHub Sync

To sync local repository with GitHub:

```bash
bash scripts/push_to_github.sh
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
