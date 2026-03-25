#!/usr/bin/env python3
"""
Command Executor - Runs registered commands with safety checks
"""

import logging
import asyncio
import json
import traceback
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class CommandExecutor:
    """Execute commands with error handling and logging"""

    def __init__(self, registry):
        self.registry = registry
        self.logger = logger
        self.max_retries = 3
        self.retry_delay = 1.0  # seconds

    async def execute(
        self,
        command_name: str,
        args: Dict[str, Any] = None,
        retry_on_failure: bool = True,
        timeout: Optional[float] = 30.0,
    ) -> Dict[str, Any]:
        """
        Execute a command with retries and timeout
        """
        args = args or {}
        attempt = 0

        while attempt < self.max_retries:
            try:
                self.logger.info(f"Executing command: {command_name} (attempt {attempt + 1}/{self.max_retries})")

                # Execute with timeout
                if timeout:
                    result = await asyncio.wait_for(
                        self.registry.execute(command_name, args),
                        timeout=timeout,
                    )
                else:
                    result = await self.registry.execute(command_name, args)

                if result.get("success"):
                    return result

                # If not successful but has result, return
                if "error" not in result or not retry_on_failure:
                    return result

                attempt += 1
                if attempt < self.max_retries:
                    self.logger.warning(
                        f"Command failed, retrying in {self.retry_delay}s: {command_name}"
                    )
                    await asyncio.sleep(self.retry_delay)

            except asyncio.TimeoutError:
                attempt += 1
                self.logger.error(f"Command timeout: {command_name} (attempt {attempt}/{self.max_retries})")
                if attempt >= self.max_retries:
                    return {
                        "success": False,
                        "command": command_name,
                        "error": f"Command timeout after {timeout}s",
                    }
                await asyncio.sleep(self.retry_delay)

            except Exception as e:
                attempt += 1
                self.logger.error(f"Command exception: {command_name} - {e}\n{traceback.format_exc()}")
                if attempt >= self.max_retries:
                    return {
                        "success": False,
                        "command": command_name,
                        "error": str(e),
                        "traceback": traceback.format_exc(),
                    }
                await asyncio.sleep(self.retry_delay)

        return {
            "success": False,
            "command": command_name,
            "error": f"Failed after {self.max_retries} attempts",
        }

    async def execute_batch(
        self,
        commands: list,  # List of {"name": str, "args": dict}
        parallel: bool = False,
        stop_on_failure: bool = False,
    ) -> list:
        """
        Execute multiple commands
        """
        results = []

        if parallel:
            # Execute all commands in parallel
            tasks = [self.execute(cmd["name"], cmd.get("args", {})) for cmd in commands]
            results = await asyncio.gather(*tasks, return_exceptions=False)
        else:
            # Execute commands sequentially
            for cmd in commands:
                result = await self.execute(cmd["name"], cmd.get("args", {}))
                results.append(result)

                if not result.get("success") and stop_on_failure:
                    self.logger.warning("Stopping batch execution due to failure")
                    break

        return results

    def get_command_info(self, command_name: str) -> Dict[str, Any]:
        """Get information about a command"""
        command = self.registry.get_command(command_name)
        if not command:
            return {"error": f"Command not found: {command_name}"}

        return command.to_dict()
