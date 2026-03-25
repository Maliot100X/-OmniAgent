#!/usr/bin/env python3
"""
Python Bridge Server - Allows Node.js to call Python agent functions
Runs as a simple HTTP/JSON-RPC server
"""

import asyncio
import json
import logging
import sys
from typing import Dict, Any
from pathlib import Path

# Setup path
sys.path.insert(0, str(Path(__file__).parent))

from core.agent_loop import AgentLoopBase
from commands.registry import CommandRegistry, CommandType
from commands.executor import CommandExecutor
from integrations.llm_providers import LLMManager, AnthropicProvider, OpenAIProvider, LocalLLMProvider
from tools import unified_tools

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class PythonBridgeServer:
    """Manages communication between Node.js and Python agents"""

    def __init__(self):
        self.registry = CommandRegistry()
        self.executor = CommandExecutor(self.registry)
        self.llm_manager = LLMManager()
        self.agent_loop = AgentLoopBase(name="OmnigentPython")
        self._init_providers()
        self._register_commands()

    def _init_providers(self) -> None:
        """Initialize LLM providers"""
        try:
            self.llm_manager.register_provider(
                "anthropic",
                AnthropicProvider(model="claude-3-5-sonnet-20241022"),
                set_default=True,
            )
            logger.info("Anthropic provider initialized")
        except Exception as e:
            logger.warning(f"Could not initialize Anthropic: {e}")

        try:
            self.llm_manager.register_provider(
                "openai",
                OpenAIProvider(model="gpt-4-turbo"),
            )
            logger.info("OpenAI provider initialized")
        except Exception as e:
            logger.warning(f"Could not initialize OpenAI: {e}")

        logger.info(f"Available providers: {list(self.llm_manager.providers.keys())}")

    def _register_commands(self) -> None:
        """Register all 30+ commands from all sources"""
        
        # ============ OPENCLAW COMMANDS ============
        self.registry.register(
            "execute_workflow",
            "Execute an OpenClaw workflow",
            unified_tools.execute_workflow,
            category=CommandType.AUTOMATION,
            source="openclaw",
            tags=["workflow", "execution"],
        )

        self.registry.register(
            "list_agents",
            "List all available agents",
            unified_tools.list_agents,
            category=CommandType.SYSTEM,
            source="openclaw",
            tags=["agents", "management"],
        )

        self.registry.register(
            "create_agent",
            "Create a new agent",
            unified_tools.create_agent,
            category=CommandType.SYSTEM,
            source="openclaw",
            tags=["agents", "creation"],
        )

        # ============ TINYAGI COMMANDS ============
        self.registry.register(
            "create_team",
            "Create a team of agents",
            unified_tools.create_team,
            category=CommandType.AUTOMATION,
            source="tinyagi",
            tags=["team", "management"],
        )

        self.registry.register(
            "add_task",
            "Add task to execution queue",
            unified_tools.add_task_to_queue,
            category=CommandType.AUTOMATION,
            source="tinyagi",
            tags=["task", "queue"],
        )

        self.registry.register(
            "execute_tasks",
            "Execute all tasks in queue",
            unified_tools.execute_tasks,
            category=CommandType.AUTOMATION,
            source="tinyagi",
            tags=["task", "execution"],
        )

        self.registry.register(
            "get_team_status",
            "Get team status",
            unified_tools.get_team_status,
            category=CommandType.SYSTEM,
            source="tinyagi",
            tags=["team", "status"],
        )

        # ============ HERMES COMMANDS ============
        self.registry.register(
            "reason_about_task",
            "Use reasoning to analyze a task",
            unified_tools.reason_about_task,
            category=CommandType.ANALYSIS,
            source="hermes",
            tags=["reasoning", "analysis"],
        )

        self.registry.register(
            "plan_execution",
            "Create execution plan",
            unified_tools.plan_execution,
            category=CommandType.ANALYSIS,
            source="hermes",
            tags=["planning", "strategy"],
        )

        self.registry.register(
            "get_reasoning_context",
            "Get reasoning context",
            unified_tools.get_reasoning_context,
            category=CommandType.ANALYSIS,
            source="hermes",
            tags=["reasoning", "context"],
        )

        # ============ CLAUDE CODE COMMANDS ============
        self.registry.register(
            "generate_code",
            "Generate code from requirement",
            unified_tools.generate_code,
            category=CommandType.CODE,
            source="claude_code",
            tags=["code", "generation"],
        )

        self.registry.register(
            "analyze_code",
            "Analyze code for issues",
            unified_tools.analyze_code,
            category=CommandType.CODE,
            source="claude_code",
            tags=["code", "analysis"],
        )

        self.registry.register(
            "debug_code",
            "Debug code issue",
            unified_tools.debug_code,
            category=CommandType.CODE,
            source="claude_code",
            tags=["code", "debugging"],
        )

        self.registry.register(
            "generate_tests",
            "Generate test cases",
            unified_tools.generate_tests,
            category=CommandType.CODE,
            source="claude_code",
            tags=["code", "testing"],
        )

        self.registry.register(
            "refactor_code",
            "Refactor code",
            unified_tools.refactor_code,
            category=CommandType.CODE,
            source="claude_code",
            tags=["code", "refactoring"],
        )

        # ============ CUSTOM/UTILITY COMMANDS ============
        self.registry.register(
            "system_command",
            "Execute system command",
            unified_tools.system_command,
            category=CommandType.SYSTEM,
            source="custom",
            tags=["system", "shell"],
        )

        self.registry.register(
            "file_read",
            "Read file content",
            unified_tools.file_read,
            category=CommandType.SYSTEM,
            source="custom",
            tags=["file", "io"],
        )

        self.registry.register(
            "file_write",
            "Write to file",
            unified_tools.file_write,
            category=CommandType.SYSTEM,
            source="custom",
            tags=["file", "io"],
        )

        self.registry.register(
            "json_parse",
            "Parse JSON string",
            unified_tools.json_parse,
            category=CommandType.SYSTEM,
            source="custom",
            tags=["json", "parsing"],
        )

        logger.info(f"Registered {len(self.registry.commands)} commands")

    async def execute_command(self, command_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a command and return result"""
        return await self.executor.execute(command_name, args)

    def list_commands(self, source: str = None) -> Dict[str, Any]:
        """List all commands"""
        return {
            "success": True,
            "commands": self.registry.list_commands(source=source),
            "total": len(self.registry.commands),
            "by_source": self.registry.get_commands_by_source(),
        }

    def get_command_info(self, command_name: str) -> Dict[str, Any]:
        """Get detailed info about a command"""
        cmd = self.registry.get_command(command_name)
        if not cmd:
            return {"success": False, "error": f"Command not found: {command_name}"}
        return {"success": True, "command": cmd.to_dict()}

    def get_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        return {
            "success": True,
            "stats": self.registry.get_stats(),
            "providers": list(self.llm_manager.providers.keys()),
        }

    def get_capabilities(self) -> Dict[str, Any]:
        """Get all system capabilities (for self-awareness)"""
        stats = self.registry.get_stats()
        return {
            "success": True,
            "system": "Omnigent Python Agent",
            "version": "1.0.0",
            "capabilities": {
                "total_commands": stats["total_commands"],
                "by_category": stats["by_category"],
                "by_source": stats["by_source"],
                "llm_providers": list(self.llm_manager.providers.keys()),
            },
            "commands": self.registry.list_commands(),
        }


async def main():
    """Main entry point for bridge server"""
    server = PythonBridgeServer()
    
    # Print startup info
    print(json.dumps({
        "status": "ready",
        "commands": len(server.registry.commands),
        "providers": list(server.llm_manager.providers.keys()),
    }))
    
    # For now, just wait - Node.js will call us via subprocess
    # In production, this could be a proper HTTP/WebSocket server
    await asyncio.sleep(float('inf'))


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Bridge server shutting down...")
