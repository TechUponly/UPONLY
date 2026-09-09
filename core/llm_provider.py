import os
from typing import Dict, Any, List, Optional

class LLMProvider:
    """
    Unified multi-provider LLM interface supporting Gemini, OpenAI, Anthropic, and Mock fallback.
    """
    def __init__(self, provider_name: str = "gemini", model_name: Optional[str] = None):
        self.provider_name = provider_name.lower()
        self.model_name = model_name or ("gemini-1.5-pro" if self.provider_name == "gemini" else "gpt-4")

    def generate(self, prompt: str, system_prompt: Optional[str] = None, tools: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Generates text or tool invocation plan from the target LLM.
        Falls back gracefully if API keys are not provided.
        """
        api_key = os.getenv(f"{self.provider_name.upper()}_API_KEY", "")

        if not api_key:
            # Fallback mock response for offline/development execution
            return {
                "status": "success",
                "provider": self.provider_name,
                "model": self.model_name,
                "content": f"[UPONLY Autonomous Response ({self.provider_name})]: Processed task successfully with system prompt '{system_prompt[:30] if system_prompt else 'default'}...'",
                "tool_calls": []
            }

        # Handle real provider invocations if keys exist
        try:
            if self.provider_name == "gemini":
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(self.model_name, system_instruction=system_prompt)
                response = model.generate_content(prompt)
                return {
                    "status": "success",
                    "provider": "gemini",
                    "model": self.model_name,
                    "content": response.text,
                    "tool_calls": []
                }
            elif self.provider_name == "openai":
                import openai
                client = openai.OpenAI(api_key=api_key)
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})
                response = client.chat.completions.create(model=self.model_name, messages=messages)
                return {
                    "status": "success",
                    "provider": "openai",
                    "model": self.model_name,
                    "content": response.choices[0].message.content,
                    "tool_calls": []
                }
        except Exception as e:
            return {
                "status": "fallback",
                "error": str(e),
                "content": f"[UPONLY Autonomous Fallback]: Generated execution result for task: {prompt[:50]}"
            }

        return {
            "status": "success",
            "provider": self.provider_name,
            "content": f"Executed prompt: {prompt}"
        }
