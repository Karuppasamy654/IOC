"""
Gemini LLM Client for PlacementEvolve AI
Provides a unified interface for calling Google Gemini API
across all 8 placement preparation agents.
"""

import os
import json
import re
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Lazy import so the module doesn't crash if the package isn't installed yet.
# ---------------------------------------------------------------------------
_genai = None

def _get_genai():
    global _genai
    if _genai is None:
        try:
            import google.generativeai as genai  # type: ignore
            api_key = os.environ.get("GOOGLE_API_KEY", "")
            if not api_key:
                raise EnvironmentError("GOOGLE_API_KEY environment variable is not set.")
            genai.configure(api_key=api_key)
            _genai = genai
        except ImportError:
            raise ImportError(
                "google-generativeai is not installed. "
                "Run: pip install google-generativeai"
            )
    return _genai


# ---------------------------------------------------------------------------
# Model selection
# ---------------------------------------------------------------------------
_MODEL_NAME = "gemini-1.5-flash"          # fast, cost-effective default
_FALLBACK_MODEL = "gemini-1.5-flash-8b"   # ultra-light fallback


def _build_model(model_name: str = _MODEL_NAME):
    genai = _get_genai()
    return genai.GenerativeModel(
        model_name=model_name,
        generation_config={
            "temperature": 0.3,    # deterministic but creative
            "top_p": 0.9,
            "top_k": 40,
            "max_output_tokens": 1024,
        },
        safety_settings=[
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
    )


# ---------------------------------------------------------------------------
# Core call helper
# ---------------------------------------------------------------------------
def call_gemini(prompt: str, model_name: str = _MODEL_NAME) -> str:
    """
    Send a prompt to Gemini and return the raw text response.
    Falls back to a lighter model on quota/error.
    """
    try:
        model = _build_model(model_name)
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as primary_err:
        logger.warning(f"Gemini [{model_name}] failed: {primary_err}. Retrying with {_FALLBACK_MODEL}.")
        try:
            model = _build_model(_FALLBACK_MODEL)
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as fallback_err:
            logger.error(f"Gemini fallback also failed: {fallback_err}")
            raise RuntimeError(f"Gemini API error: {fallback_err}") from fallback_err


def call_gemini_json(prompt: str, model_name: str = _MODEL_NAME) -> Dict[str, Any]:
    """
    Call Gemini and parse the response as JSON.
    Strips markdown code fences if the model adds them.
    """
    raw = call_gemini(prompt, model_name)
    # Strip ```json ... ``` or ``` ... ``` wrappers
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip())
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed. Raw output:\n{raw}\nError: {e}")
        raise ValueError(f"Gemini returned non-JSON output: {e}") from e


def is_available() -> bool:
    """Returns True if the Gemini SDK is installed and GOOGLE_API_KEY is set."""
    try:
        _get_genai()
        return True
    except Exception:
        return False
