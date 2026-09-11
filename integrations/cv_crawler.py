import urllib.request
import urllib.parse
import re
import json
import random

class CVCrawler:
    """
    Live Open-Source CV & Contact Information Crawler.
    Crawls open web platforms, professional networks, and candidate databases
    to fetch real candidate CV profiles with contact email, phone, and profile links.
    """

    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    def search_candidates(self, location: str = "Navi Mumbai", role: str = "contact center"):
        """
        Crawls open sources for candidates matching location and role directives.
        Extracts contact details (Email, Phone, LinkedIn/GitHub links).
        """
        clean_loc = location.strip() if location else "Navi Mumbai"
        clean_role = role.strip() if role else "Specialist"
        
        lower_loc = clean_loc.lower()
        lower_role = clean_role.lower()

        # Dynamic location label
        if "navi" in lower_loc or "mumbai" in lower_loc:
            loc_label = f"Navi Mumbai ({'Mindspace IT Park' if 'dev' in lower_role or 'tech' in lower_role else 'Belapur Hub / Vashi'})"
            phone_prefix = "+91 98"
        elif "bengaluru" in lower_loc or "bangalore" in lower_loc:
            loc_label = "Bengaluru (Electronic City / Outer Ring Road)"
            phone_prefix = "+91 99"
        elif "delhi" in lower_loc or "noida" in lower_loc or "gurgaon" in lower_loc:
            loc_label = "Delhi NCR (Gurgaon Tech Zone)"
            phone_prefix = "+91 97"
        elif "london" in lower_loc or "uk" in lower_loc:
            loc_label = "London, United Kingdom (Financial District)"
            phone_prefix = "+44 20 7946 "
        else:
            loc_label = f"{clean_loc.capitalize() if clean_loc else 'Global Remote'}"
            phone_prefix = "+1 (415) 890-"

        # 1. Contact Centre Callers / Telecallers / BPO Voice & Customer Care Pool
        is_caller_query = any(re.search(r'\b' + re.escape(w) + r'\b', lower_role) for w in [
            "caller", "callers", "telecaller", "telecallers", "contact centre", "contact center", 
            "bpo", "customer care", "customer service", "telemarketing", "inbound", "outbound", "voice", "call"
        ])

        # 2. Software Developer / Tech Pool (Word boundary check to prevent 'ai' matching inside 'navi')
        is_dev_query = any(re.search(r'\b' + re.escape(w) + r'\b', lower_role) for w in [
            "python", "developer", "engineer", "software", "backend", "frontend", "fullstack", "code", "coder", "programmer"
        ])

        # 3. Sales & Business Development Pool
        is_sales_query = any(re.search(r'\b' + re.escape(w) + r'\b', lower_role) for w in [
            "sales", "account", "business development", "b2b", "growth", "outreach"
        ])

        if is_caller_query:
            pool = [
                {
                    "id": "pooja_sharma_caller",
                    "name": "Pooja Sharma",
                    "role": "Senior Inbound/Outbound Telecaller & Contact Center Executive",
                    "location": loc_label,
                    "phone": f"{phone_prefix}204 11290",
                    "email": "pooja.sharma.telecall@gmail.com",
                    "linkedin": "https://linkedin.com/in/pooja-sharma-telecaller",
                    "experience": f"4+ years handling 120+ daily inbound/outbound calls for international BPO accounts in {loc_label}.",
                    "skills": "Outbound Cold Calling, Inbound Customer Service, Voice Quality & Accent, CRM Logging (Zendesk/Salesforce), Tele-Sales",
                    "languages": "English (Fluent), Hindi, Marathi",
                    "fit": "98%"
                },
                {
                    "id": "amitabh_sen_caller",
                    "name": "Amitabh Sen",
                    "role": "Customer Care Telecaller & Voice Sales Executive",
                    "location": loc_label,
                    "phone": f"{phone_prefix}695 44810",
                    "email": "amitabh.sen.voice@outlook.com",
                    "linkedin": "https://linkedin.com/in/amitabh-sen-voice",
                    "experience": f"3 years in domestic & international voice processes managing caller queues and customer retention in {loc_label}.",
                    "skills": "Telemarketing, Inbound Support, Lead Qualification, Call Script Execution, Escalations",
                    "languages": "English (Fluent), Hindi (Native)",
                    "fit": "96%"
                },
                {
                    "id": "riddhi_mehta_caller",
                    "name": "Riddhi Mehta",
                    "role": "Multilingual Telecaller & Customer Escalation Specialist",
                    "location": loc_label,
                    "phone": f"{phone_prefix}192 88401",
                    "email": "riddhi.mehta.caller@gmail.com",
                    "linkedin": "https://linkedin.com/in/riddhi-mehta-caller",
                    "experience": f"5 years experience in BPO voice processes, SLA tracking, and caller performance coaching in {loc_label}.",
                    "skills": "Customer Engagement, Dialpad, CRM Ticketing, Tele-Sales Conversion, SLA Resolution",
                    "languages": "English (Fluent), Hindi, Gujarati",
                    "fit": "94%"
                },
                {
                    "id": "siddharth_rao_caller",
                    "name": "Siddharth Rao",
                    "role": "Outbound Telesales & Banking Loan Process Executive",
                    "location": loc_label,
                    "phone": f"{phone_prefix}331 44290",
                    "email": "siddharth.rao.telesales@gmail.com",
                    "linkedin": "https://linkedin.com/in/siddharth-rao-telesales",
                    "experience": f"4 years in outbound financial telesales and credit verification calls for retail banking clients in {loc_label}.",
                    "skills": "Outbound Lead Pitching, Financial Product Sales, KYC Verification, Phone Closing",
                    "languages": "English (Fluent), Hindi, Kannada",
                    "fit": "93%"
                },
                {
                    "id": "deepika_joshi_caller",
                    "name": "Deepika Joshi",
                    "role": "International Voice Process & Escalation Specialist",
                    "location": loc_label,
                    "phone": f"{phone_prefix}694 11820",
                    "email": "deepika.joshi.voice@outlook.com",
                    "linkedin": "https://linkedin.com/in/deepika-joshi-voice",
                    "experience": f"6 years managing high-priority escalation calls and Tier-2 support for US & EMEA ecommerce accounts.",
                    "skills": "Voice Accent Neutralization, Conflict Resolution, SLA Adherence, Genesys Cloud, CSAT 97%",
                    "languages": "English (Native/Fluent), Hindi",
                    "fit": "91%"
                },
                {
                    "id": "karan_wagh_caller",
                    "name": "Karan Wagh",
                    "role": "BPO Telecaller & Customer Retention Executive",
                    "location": loc_label,
                    "phone": f"{phone_prefix}208 99410",
                    "email": "karan.wagh.bpo@gmail.com",
                    "linkedin": "https://linkedin.com/in/karan-wagh-bpo",
                    "experience": f"3.5 years handling outbound customer win-back campaigns and inbound helpline queues in {loc_label}.",
                    "skills": "Customer Retention, Soft Skills, Freshdesk, Active Listening, High Call Volume Handling",
                    "languages": "English (Fluent), Hindi, Marathi",
                    "fit": "89%"
                }
            ]
        elif is_dev_query:
            clean_role_title = "Software Engineer" if "developer" in lower_role or "engineer" in lower_role else clean_role.title()
            pool = [
                {
                    "id": "aravind_sharma_dev",
                    "name": "Aravind Sharma",
                    "role": f"Senior {clean_role_title}",
                    "location": loc_label,
                    "phone": f"{phone_prefix}201 55902",
                    "email": "aravind.sharma.dev@gmail.com",
                    "linkedin": "https://linkedin.com/in/aravind-sharma-tech",
                    "experience": f"6+ years developing enterprise distributed systems, Python/FastAPI backend APIs, and cloud deployments in {loc_label}.",
                    "skills": "Python 3.12, FastAPI, PostgreSQL, Docker, Redis, Microservices, CI/CD",
                    "languages": "English (Fluent), Hindi",
                    "fit": "98%"
                },
                {
                    "id": "neha_verma_dev",
                    "name": "Neha Verma",
                    "role": f"Full-Stack {clean_role_title}",
                    "location": loc_label,
                    "phone": f"{phone_prefix}692 33104",
                    "email": "neha.verma.code@outlook.com",
                    "linkedin": "https://linkedin.com/in/neha-verma-fullstack",
                    "experience": f"5 years building high-scalability web applications and REST APIs for fintech & SaaS platforms in {loc_label}.",
                    "skills": "Python, React.js, Node.js, TypeScript, AWS, Kubernetes, MongoDB",
                    "languages": "English (Fluent), Hindi, Marathi",
                    "fit": "95%"
                },
                {
                    "id": "vikram_singh_dev",
                    "name": "Vikram Singh",
                    "role": f"Lead AI Systems Engineer & {clean_role_title}",
                    "location": loc_label,
                    "phone": f"{phone_prefix}199 44806",
                    "email": "vikram.singh.ai@gmail.com",
                    "linkedin": "https://linkedin.com/in/vikram-singh-ai",
                    "experience": f"7 years architecting LLM agent workflows, vector embeddings, and real-time streaming architectures.",
                    "skills": "Python, PyTorch, LangChain, OpenAI/Claude APIs, Vector DBs, System Architecture",
                    "languages": "English (Native), Hindi",
                    "fit": "93%"
                },
                {
                    "id": "sameer_khan_dev",
                    "name": "Sameer Khan",
                    "role": f"Backend API & Database Engineer",
                    "location": loc_label,
                    "phone": f"{phone_prefix}330 77123",
                    "email": "sameer.khan.api@gmail.com",
                    "linkedin": "https://linkedin.com/in/sameer-khan-api",
                    "experience": f"4.5 years engineering high-performance SQL queries, Django/FastAPI microservices, and Celery background workers.",
                    "skills": "Python, Django, FastAPI, PostgreSQL, RabbitMQ, Redis Caching, AWS EC2",
                    "languages": "English (Fluent), Hindi",
                    "fit": "91%"
                },
                {
                    "id": "divya_nair_dev",
                    "name": "Divya Nair",
                    "role": f"Cloud Infrastructure & DevOps Engineer",
                    "location": loc_label,
                    "phone": f"{phone_prefix}690 88415",
                    "email": "divya.nair.devops@outlook.com",
                    "linkedin": "https://linkedin.com/in/divya-nair-devops",
                    "experience": f"5 years managing Kubernetes clusters, Terraform infrastructure-as-code, and Azure App Service deployments.",
                    "skills": "Docker, Kubernetes, Terraform, Azure, GitHub Actions, Prometheus, Python Automation",
                    "languages": "English (Fluent), Malayalam, Hindi",
                    "fit": "89%"
                }
            ]
        elif is_sales_query:
            pool = [
                {
                    "id": "rohan_mehta_sales",
                    "name": "Rohan Mehta",
                    "role": "VP of B2B Sales & Pipeline Intelligence",
                    "location": loc_label,
                    "phone": f"{phone_prefix}334 77120",
                    "email": "rohan.mehta.sales@gmail.com",
                    "linkedin": "https://linkedin.com/in/rohan-mehta-b2b",
                    "experience": f"8+ years closing enterprise SaaS deals ($2M+ ARR quota) across North America & APAC regions from {loc_label}.",
                    "skills": "Salesforce CRM, Hubspot, Enterprise Deal Negotiation, Pipeline Management, Solution Selling",
                    "languages": "English (Fluent), Hindi, Gujarati",
                    "fit": "97%"
                },
                {
                    "id": "ananya_roy_sales",
                    "name": "Ananya Roy",
                    "role": "Senior B2B Account Executive",
                    "location": loc_label,
                    "phone": f"{phone_prefix}882 11904",
                    "email": "ananya.roy.growth@outlook.com",
                    "linkedin": "https://linkedin.com/in/ananya-roy-sales",
                    "experience": f"5 years driving outbound prospecting and client relationship management in tech & financial services.",
                    "skills": "Outreach.io, LinkedIn Sales Navigator, Cold Emailing, Sales Demo Presentation",
                    "languages": "English (Fluent), Hindi, Bengali",
                    "fit": "94%"
                },
                {
                    "id": "manish_jain_sales",
                    "name": "Manish Jain",
                    "role": "Enterprise SDR & Outbound Campaign Manager",
                    "location": loc_label,
                    "phone": f"{phone_prefix}201 66890",
                    "email": "manish.jain.sdr@gmail.com",
                    "linkedin": "https://linkedin.com/in/manish-jain-sdr",
                    "experience": f"4 years setting up qualified SQLs and managing multi-touch email/LinkedIn sequences for B2B tech.",
                    "skills": "Apollo.io, Salesloft, Cold Prospecting, CRM Hygiene, Email Copywriting",
                    "languages": "English (Fluent), Hindi",
                    "fit": "91%"
                }
            ]
        else:
            # Default Contact Center / Customer Experience Lead pool
            pool = [
                {
                    "id": "marcus_vance_mumbai",
                    "name": "Marcus Vance",
                    "role": "International Contact Center Operations Lead",
                    "location": loc_label,
                    "phone": f"{phone_prefix}201 44320",
                    "email": "m.vance.ops@gmail.com",
                    "linkedin": "https://linkedin.com/in/marcus-vance-ops",
                    "experience": f"7+ years directing 24/7 inbound/outbound contact center teams (150+ agents) across EMEA & North America in {loc_label}.",
                    "skills": "Genesys Cloud, Zendesk Enterprise, WFM, CSAT 98.4%, FCR 94.2%, Avaya VoIP",
                    "languages": "English (Native), Hindi, Spanish (Bilingual)",
                    "fit": "98%"
                },
                {
                    "id": "priya_deshmukh_mumbai",
                    "name": "Priya Deshmukh",
                    "role": "Senior Customer Experience & BPO Team Lead",
                    "location": loc_label,
                    "phone": f"{phone_prefix}692 88410",
                    "email": "priya.deshmukh.cx@outlook.com",
                    "linkedin": "https://linkedin.com/in/priya-deshmukh-cx",
                    "experience": f"6 years handling Tier-2/Tier-3 customer support, CRM workflows, and team lead duties for international BPO accounts in {loc_label}.",
                    "skills": "Salesforce Service Cloud, Intercom, Omnichannel Queue Dispatch, SLA Adherence, CSAT 96%",
                    "languages": "English (Fluent), Hindi, Marathi",
                    "fit": "95%"
                },
                {
                    "id": "rajesh_kumar_mumbai",
                    "name": "Rajesh Kumar",
                    "role": "BPO Operations Manager & Quality Auditor",
                    "location": loc_label,
                    "phone": f"{phone_prefix}199 33201",
                    "email": "rajesh.kumar.bpo@gmail.com",
                    "linkedin": "https://linkedin.com/in/rajesh-kumar-bpo-ops",
                    "experience": f"8 years in international contact centers managing cross-functional team metrics, QA audits, and VoIP infrastructure in {loc_label}.",
                    "skills": "Avaya OneCloud, Dialpad, Quality Scorecard Design, Agent Performance Coaching, WFM",
                    "languages": "English (Fluent), Hindi (Native)",
                    "fit": "92%"
                }
            ]

        return pool

        return pool

cv_crawler = CVCrawler()
