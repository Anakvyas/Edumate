import os

import requests
from env_config import ENV_PATH
from redis_cache import build_cache_key, get_json, set_json

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "stepfun/step-3.5-flash:free")
HTTP_SESSION = requests.Session()


def _stringify_content(content):
    if isinstance(content, str):
        return content.strip()

    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                parts.append(item.get("text", ""))
            elif isinstance(item, str):
                parts.append(item)
        return "".join(parts).strip()

    return str(content).strip()


def chat_completion(messages, temperature=0.7, model=None, timeout=120):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError(f"OPENROUTER_API_KEY is not set. Expected it in {ENV_PATH}.")

    resolved_model = model or DEFAULT_MODEL
    cache_key = build_cache_key(
        "openrouter:chat",
        {
            "messages": messages,
            "temperature": temperature,
            "model": resolved_model,
        },
    )
    cached_response = get_json(cache_key)
    if isinstance(cached_response, str):
        return cached_response

    response = HTTP_SESSION.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": resolved_model,
            "messages": messages,
            "temperature": temperature,
        },
        timeout=timeout,
    )

    try:
        response.raise_for_status()
    except requests.HTTPError as exc:
        raise RuntimeError(f"OpenRouter request failed: {response.text}") from exc

    payload = response.json()
    choices = payload.get("choices") or []
    if not choices:
        raise RuntimeError("OpenRouter returned no choices.")

    message = choices[0].get("message", {})
    content = _stringify_content(message.get("content", ""))
    set_json(cache_key, content)
    return content


def prompt_completion(prompt, temperature=0.7, model=None, system_prompt=None, timeout=120):
    messages = []

    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})

    messages.append({"role": "user", "content": prompt})
    return chat_completion(messages, temperature=temperature, model=model, timeout=timeout)
