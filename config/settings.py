import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseModel):
    app_name: str = "UPONLY Business Automation Platform"
    version: str = "1.1.0"
    env: str = os.getenv("ENV", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))

    # LLM Settings (Claude 3.5 Sonnet Peak Engine Default)
    default_llm_provider: str = os.getenv("DEFAULT_LLM_PROVIDER", "anthropic")
    default_model: str = os.getenv("DEFAULT_MODEL", "claude-3-5-sonnet-20241022")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    # Paths
    base_dir: Path = BASE_DIR
    agents_config_path: Path = BASE_DIR / "config" / "agents.yaml"

settings = Settings()
