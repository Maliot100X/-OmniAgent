#!/usr/bin/env python3
"""
Universal Command Registry System
Exposes ALL tools and commands from integrated projects
"""

import json
import logging
import asyncio
from typing import Dict, List, Any, Callable, Optional
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)


class CommandType(Enum):
    """Command types"""
    TOOL = "tool"
    WORKFLOW = "workflow"
    SYSTEM = "system"
    ANALYSIS = "analysis"
    CODE = "code"
    AUTOMATION = "automation"


@dataclass
class CommandSchema:
    """Schema for command input validation"""
    type: str  # "string", "integer", "object", "array", etc.
    description: str = ""
    required: bool = True
    default: Any = None
    enum: List[Any] = None


@dataclass
class Command:
    """Universal command definition"""
    name: str
    description: str
    category: CommandType
    handler: Callable
    input_schema: Dict[str, CommandSchema] = None
    output_schema: Dict[str, Any] = None
    source: str = "unified"  # Which source project (openclaw, tinyagi, hermes, claude_code, custom)
    enabled: bool = True
    tags: List[str] = None

    def __post_init__(self):
        if self.input_schema is None:
            self.input_schema = {}
        if self.tags is None:
            self.tags = []

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, excluding handler"""
        d = asdict(self)
        d.pop("handler", None)
        return d


class CommandRegistry:
    """
    Central registry for all commands from all integrated projects
    """

    def __init__(self):
        self.commands: Dict[str, Command] = {}
        self.command_history: List[Dict[str, Any]] = []
        self.logger = logger

    def register(
        self,
        name: str,
        description: str,
        handler: Callable,
        category: CommandType = CommandType.TOOL,
        input_schema: Dict[str, CommandSchema] = None,
        output_schema: Dict[str, Any] = None,
        source: str = "unified",
        tags: List[str] = None,
    ) -> Command:
        """
        Register a new command
        """
        if name in self.commands:
            logger.warning(f"Command already exists: {name}, overwriting")

        command = Command(
            name=name,
            description=description,
            handler=handler,
            category=category,
            input_schema=input_schema or {},
            output_schema=output_schema,
            source=source,
            tags=tags or [],
        )

        self.commands[name] = command
        logger.info(f"Command registered: {name} ({source})")
        return command

    def unregister(self, name: str) -> bool:
        """Unregister a command"""
        if name in self.commands:
            del self.commands[name]
            logger.info(f"Command unregistered: {name}")
            return True
        return False

    def get_command(self, name: str) -> Optional[Command]:
        """Get a specific command"""
        return self.commands.get(name)

    def list_commands(self, category: Optional[CommandType] = None, source: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all registered commands
        Can filter by category or source
        """
        commands = list(self.commands.values())

        if category:
            commands = [c for c in commands if c.category == category]

        if source:
            commands = [c for c in commands if c.source == source]

        return [c.to_dict() for c in commands]

    def get_commands_by_source(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get commands grouped by source project"""
        grouped = {}
        for command in self.commands.values():
            if command.source not in grouped:
                grouped[command.source] = []
            grouped[command.source].append(command.to_dict())
        return grouped

    def search_commands(self, query: str) -> List[Dict[str, Any]]:
        """Search commands by name or description"""
        query = query.lower()
        results = []

        for command in self.commands.values():
            if query in command.name.lower() or query in command.description.lower():
                results.append(command.to_dict())

        return results

    async def execute(self, command_name: str, args: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
        """
        Execute a registered command
        """
        args = args or {}
        all_args = {**args, **kwargs}

        command = self.get_command(command_name)
        if not command:
            return {
                "success": False,
                "error": f"Command not found: {command_name}",
                "available_commands": list(self.commands.keys()),
            }

        if not command.enabled:
            return {
                "success": False,
                "error": f"Command is disabled: {command_name}",
            }

        try:
            # Validate inputs if schema exists
            # TODO: Implement schema validation

            # Execute handler
            if asyncio.iscoroutinefunction(command.handler):
                result = await command.handler(**all_args)
            else:
                result = command.handler(**all_args)

            # Record execution
            execution_record = {
                "command": command_name,
                "args": all_args,
                "result": result,
                "success": True,
            }
            self.command_history.append(execution_record)

            logger.info(f"Command executed: {command_name}")

            return {
                "success": True,
                "command": command_name,
                "result": result,
            }

        except Exception as e:
            logger.error(f"Command execution failed: {command_name} - {e}")
            return {
                "success": False,
                "command": command_name,
                "error": str(e),
            }

    def get_execution_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent command execution history"""
        return self.command_history[-limit:]

    def get_stats(self) -> Dict[str, Any]:
        """Get registry statistics"""
        categories = {}
        sources = {}

        for command in self.commands.values():
            cat = command.category.value
            src = command.source

            categories[cat] = categories.get(cat, 0) + 1
            sources[src] = sources.get(src, 0) + 1

        return {
            "total_commands": len(self.commands),
            "by_category": categories,
            "by_source": sources,
            "execution_history_size": len(self.command_history),
            "enabled_commands": len([c for c in self.commands.values() if c.enabled]),
        }

    def export_schema(self) -> Dict[str, Any]:
        """Export full command schema for documentation"""
        return {
            "total_commands": len(self.commands),
            "commands": {name: cmd.to_dict() for name, cmd in self.commands.items()},
            "categories": [cat.value for cat in CommandType],
            "sources": list(set(cmd.source for cmd in self.commands.values())),
        }
