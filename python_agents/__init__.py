#!/usr/bin/env python3
"""
Omnigent Python Agents Module
Provides unified interface for all AI agent capabilities
"""

from .core.agent_loop import AgentLoopBase, AgentMemory, Task, ToolCall, AgentState
from .commands.registry import CommandRegistry, CommandType, Command
from .commands.executor import CommandExecutor
from .integrations.llm_providers import LLMManager, AnthropicProvider, OpenAIProvider, LocalLLMProvider

__version__ = "1.0.0"
__all__ = [
    "AgentLoopBase",
    "AgentMemory",
    "Task",
    "ToolCall",
    "AgentState",
    "CommandRegistry",
    "CommandType",
    "Command",
    "CommandExecutor",
    "LLMManager",
    "AnthropicProvider",
    "OpenAIProvider",
    "LocalLLMProvider",
]
