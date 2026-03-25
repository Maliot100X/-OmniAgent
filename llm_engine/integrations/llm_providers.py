#!/usr/bin/env python3
"""
LLM Provider Abstraction Layer
Supports OpenAI, Anthropic, and local models
"""

import logging
from typing import Dict, List, Any, Optional, AsyncGenerator
from abc import ABC, abstractmethod
import os
import json

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """Base class for all LLM providers"""

    @abstractmethod
    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate text from prompt"""
        pass

    @abstractmethod
    async def stream(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        """Stream text generation"""
        pass

    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        pass


class AnthropicProvider(LLMProvider):
    """Anthropic Claude API provider"""

    def __init__(self, api_key: str = None, model: str = "claude-3-5-sonnet-20241022"):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.model = model
        self.client = None

        try:
            import anthropic
            self.client = anthropic.Anthropic(api_key=self.api_key)
            logger.info(f"Anthropic provider initialized: {model}")
        except ImportError:
            logger.error("Anthropic SDK not installed: pip install anthropic")

    async def generate(self, prompt: str, max_tokens: int = 2048, **kwargs) -> str:
        """Generate text using Claude"""
        if not self.client:
            raise RuntimeError("Anthropic client not initialized")

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic generation failed: {e}")
            raise

    async def stream(self, prompt: str, max_tokens: int = 2048, **kwargs) -> AsyncGenerator[str, None]:
        """Stream text generation from Claude"""
        if not self.client:
            raise RuntimeError("Anthropic client not initialized")

        try:
            with self.client.messages.stream(
                model=self.model,
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            ) as stream:
                for text in stream.text_stream:
                    yield text
        except Exception as e:
            logger.error(f"Anthropic streaming failed: {e}")
            raise

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "provider": "anthropic",
            "model": self.model,
            "type": "text-generation",
            "context_window": 200000,
        }


class OpenAIProvider(LLMProvider):
    """OpenAI API provider"""

    def __init__(self, api_key: str = None, model: str = "gpt-4-turbo"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model
        self.client = None

        try:
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=self.api_key)
            logger.info(f"OpenAI provider initialized: {model}")
        except ImportError:
            logger.error("OpenAI SDK not installed: pip install openai")

    async def generate(self, prompt: str, max_tokens: int = 2048, **kwargs) -> str:
        """Generate text using OpenAI"""
        if not self.client:
            raise RuntimeError("OpenAI client not initialized")

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI generation failed: {e}")
            raise

    async def stream(self, prompt: str, max_tokens: int = 2048, **kwargs) -> AsyncGenerator[str, None]:
        """Stream text generation from OpenAI"""
        if not self.client:
            raise RuntimeError("OpenAI client not initialized")

        try:
            async with await self.client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}],
                stream=True,
                **kwargs
            ) as stream:
                async for chunk in stream:
                    if chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"OpenAI streaming failed: {e}")
            raise

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "provider": "openai",
            "model": self.model,
            "type": "text-generation",
            "context_window": 128000,
        }


class LocalLLMProvider(LLMProvider):
    """Local LLM provider (e.g., Ollama)"""

    def __init__(self, model: str = "mistral", base_url: str = "http://localhost:11434"):
        self.model = model
        self.base_url = base_url
        self.client = None

        try:
            import requests
            self.client = requests
            logger.info(f"Local LLM provider initialized: {model} at {base_url}")
        except ImportError:
            logger.error("Requests library not installed: pip install requests")

    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate text using local LLM"""
        if not self.client:
            raise RuntimeError("Requests client not initialized")

        try:
            response = self.client.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=120,
            )
            response.raise_for_status()
            return response.json()["response"]
        except Exception as e:
            logger.error(f"Local LLM generation failed: {e}")
            raise

    async def stream(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        """Stream text generation from local LLM"""
        if not self.client:
            raise RuntimeError("Requests client not initialized")

        try:
            response = self.client.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": True},
                timeout=120,
                stream=True,
            )
            response.raise_for_status()

            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    if "response" in data:
                        yield data["response"]
        except Exception as e:
            logger.error(f"Local LLM streaming failed: {e}")
            raise

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "provider": "local",
            "model": self.model,
            "base_url": self.base_url,
            "type": "text-generation",
        }


class LLMManager:
    """Manage multiple LLM providers"""

    def __init__(self):
        self.providers: Dict[str, LLMProvider] = {}
        self.default_provider = None

    def register_provider(self, name: str, provider: LLMProvider, set_default: bool = False) -> None:
        """Register an LLM provider"""
        self.providers[name] = provider
        if set_default or not self.default_provider:
            self.default_provider = name
        logger.info(f"Provider registered: {name}")

    def get_provider(self, name: str = None) -> LLMProvider:
        """Get a provider by name or get default"""
        name = name or self.default_provider
        if name not in self.providers:
            raise ValueError(f"Provider not found: {name}")
        return self.providers[name]

    def list_providers(self) -> Dict[str, Dict[str, Any]]:
        """List all registered providers"""
        return {name: provider.get_model_info() for name, provider in self.providers.items()}

    async def generate(self, prompt: str, provider: str = None, **kwargs) -> str:
        """Generate using specified or default provider"""
        p = self.get_provider(provider)
        return await p.generate(prompt, **kwargs)

    async def stream(self, prompt: str, provider: str = None, **kwargs) -> AsyncGenerator[str, None]:
        """Stream using specified or default provider"""
        p = self.get_provider(provider)
        async for chunk in p.stream(prompt, **kwargs):
            yield chunk
