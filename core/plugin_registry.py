import time
from typing import Dict, Any, List

class PluginRegistry:
    """
    Registry for 3rd-Party High-Performance Integration Plugins in UPONLY.
    """
    def __init__(self):
        self.plugins: Dict[str, Dict[str, Any]] = {
            "vector_memory": {
                "id": "vector_memory",
                "name": "ChromaDB / Qdrant Vector Memory Plugin",
                "category": "High Performance Memory & RAG",
                "description": "Accelerates long-term agent memory retrieval using high-speed vector embeddings.",
                "status": "ACTIVE",
                "version": "2.1.0",
                "icon": "🧠"
            },
            "web_crawler": {
                "id": "web_crawler",
                "name": "Playwright / Crawl4AI High-Speed Web Scraper",
                "category": "Headless Web Automation",
                "description": "High-throughput headless browser engine for hiring site crawling, market research, and lead scraping.",
                "status": "ACTIVE",
                "version": "1.4.2",
                "icon": "🌐"
            },
            "slack_bot": {
                "id": "slack_bot",
                "name": "Slack & WhatsApp Corporate Connector",
                "category": "Messaging & Communication",
                "description": "Enables AI agents to send instant alerts, report daily progress, and receive commands via Slack & WhatsApp.",
                "status": "ACTIVE",
                "version": "3.0.1",
                "icon": "💬"
            },
            "stripe_billing": {
                "id": "stripe_billing",
                "name": "Stripe & Razorpay Automated Billing Engine",
                "category": "Fintech & Payments",
                "description": "Allows Finance Agent to auto-reconcile invoices, verify payment webhooks, and issue refunds.",
                "status": "INSTALLED",
                "version": "1.8.0",
                "icon": "💳"
            },
            "devops_docker": {
                "id": "devops_docker",
                "name": "Docker & GitHub Actions CI/CD Plugin",
                "category": "DevOps Automation",
                "description": "Equips Operations Agent with container deployment, build pipeline triggers, and cloud orchestration.",
                "status": "INSTALLED",
                "version": "2.0.4",
                "icon": "🐳"
            }
        }

    def list_plugins(self) -> List[Dict[str, Any]]:
        return list(self.plugins.values())

    def toggle_plugin(self, plugin_id: str) -> Dict[str, Any]:
        if plugin_id not in self.plugins:
            raise ValueError(f"Plugin '{plugin_id}' not found.")
        plugin = self.plugins[plugin_id]
        plugin["status"] = "ACTIVE" if plugin["status"] != "ACTIVE" else "INSTALLED"
        return plugin

plugin_registry = PluginRegistry()
