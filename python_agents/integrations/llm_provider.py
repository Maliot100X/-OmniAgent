#!/usr/bin/env python3
"""
LLM Provider Abstraction Layer
Supports: OpenAI, Anthropic, Local Models
"""

import logging
import json
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
from dataclasses import dataclass
import os

logger = logging.getLogger(__name__)


@dataclass
class LLMConfig:
    """LLM Configuration"""
    provider: str  # "openai", "anthropic", "local"
    model: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 2048
    timeout: int = 30


class LLMProvider(ABC):
    """Base class for LLM providers"""

    def __init__(self, config: LLMConfig):
        self.config = config
        self.logger = logger

    @abstractmethod
    async def complete(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """Generate completion"""
        pass

    @abstractmethod
    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Chat completion"""
        pass


class AnthropicProvider(LLMProvider):
    """Anthropic Claude API Provider"""

    def __init__(self, config: LLMConfig):
        super().__init__(config)
        self.api_key = config.api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")

        try:
            import anthropic
            self.client = anthropic.Anthropic(api_key=self.api_key)
        except ImportError:
            raise ImportError("anthropic package not installed. Install with: pip install anthropic")

    async def complete(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """Generate completion using Claude"""
        try:
            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=self.config.max_tokens,
                system=system_prompt or "",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=self.config.temperature,
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic completion failed: {e}")
            raise

    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Chat completion using Claude"""
        try:
            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=self.config.max_tokens,
                messages=messages,
                temperature=self.config.temperature,
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic chat failed: {e}")
            raise


class OpenAIProvider(LLMProvider):
    """OpenAI API Provider"""

    def __init__(self, config: LLMConfig):
        super().__init__(config)
        self.api_key = config.api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set")

        try:
            import openai
            openai.api_key = self.api_key
            self.client = openai.OpenAI(api_key=self.api_key)
        except ImportError:
            raise ImportError("openai package not installed. Install with: pip install openai")

    async def complete(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """Generate completion using OpenAI"""
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = self.client.chat.completions.create(
                model=self.config.model,
                messages=messages,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI completion failed: {e}")
            raise

    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Chat completion using OpenAI"""
        try:
            response = self.client.chat.completions.create(
                model=self.config.model,
                messages=messages,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI chat failed: {e}")
            raise


class LocalProvider(LLMProvider):
    """Local LLM Provider (Ollama, LLaMA.cpp, etc.)"""

    def __init__(self, config: LLMConfig):
        super().__init__(config)
        self.base_url = config.base_url or "http://localhost:11434"

        try:
            import requests
            self.requests = requests
        except ImportError:
            raise ImportError("requests package not installed. Install with: pip install requests")

    async def complete(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """Generate completion using local LLM"""
        try:
            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt

            response = self.requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.config.model,
                    "prompt": full_prompt,
                    "stream": False,
                },
                timeout=self.config.timeout,
            )
            response.raise_for_status()
            return response.json().get("response", "")
        except Exception as e:
            logger.error(f"Local LLM completion failed: {e}")
            raise

    async def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Chat completion using local LLM"""
        # Convert messages to prompt format
        prompt = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
        return await self.complete(prompt)


class LLMProviderFactory:
    """Factory for creating LLM providers"""

    _providers = {
        "anthropic": AnthropicProvider,
        "openai": OpenAIProvider,
        "local": LocalProvider,
    }

    @classmethod
    def create(cls, config: LLMConfig) -> LLMProvider:
        """Create LLM provider instance"""
        provider_class = cls._providers.get(config.provider.lower())
        if not provider_class:
            raise ValueError(f"Unknown provider: {config.provider}")

        return provider_class(config)

    @classmethod
    def register_provider(cls, name: str, provider_class: type) -> None:
        """Register custom provider"""
        cls._providers[name.lower()] = provider_class

    @classmethod
    def list_providers(cls) -> List[str]:
        """List available providers"""
        return list(cls._providers.keys())
