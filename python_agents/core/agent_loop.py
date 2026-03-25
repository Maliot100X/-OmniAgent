#!/usr/bin/env python3
"""
Core Agent Loop - Based on TinyAGI autonomous loop concept
Integrates Hermes reasoning and planning
"""

import json
import time
import logging
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, asdict
import asyncio

logger = logging.getLogger(__name__)


class AgentState(Enum):
    """Agent execution states"""
    IDLE = "idle"
    PLANNING = "planning"
    EXECUTING = "executing"
    REASONING = "reasoning"
    WAITING = "waiting"
    ERROR = "error"
    COMPLETE = "complete"


@dataclass
class Task:
    """Task representation"""
    id: str
    description: str
    priority: int = 0
    status: str = "pending"
    created_at: str = None
    completed_at: str = None
    result: Any = None
    error: str = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()


@dataclass
class ToolCall:
    """Tool execution record"""
    tool_name: str
    args: Dict[str, Any]
    result: Any = None
    error: str = None
    execution_time: float = 0.0
    timestamp: str = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()


class AgentMemory:
    """Agent memory management"""

    def __init__(self, max_history: int = 100):
        self.max_history = max_history
        self.tasks: Dict[str, Task] = {}
        self.tool_calls: List[ToolCall] = []
        self.conversation_history: List[Dict[str, str]] = []
        self.context: Dict[str, Any] = {}

    def add_task(self, task: Task) -> None:
        """Add task to memory"""
        self.tasks[task.id] = task
        logger.info(f"Task added: {task.id}")

    def update_task(self, task_id: str, status: str, result: Any = None, error: str = None) -> None:
        """Update task status"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.status = status
            if result:
                task.result = result
            if error:
                task.error = error
            if status == "completed":
                task.completed_at = datetime.now().isoformat()
            logger.info(f"Task updated: {task_id} -> {status}")

    def add_tool_call(self, call: ToolCall) -> None:
        """Record tool call"""
        self.tool_calls.append(call)
        if len(self.tool_calls) > self.max_history:
            self.tool_calls.pop(0)

    def get_context(self) -> Dict[str, Any]:
        """Get current context"""
        return {
            "timestamp": datetime.now().isoformat(),
            "active_tasks": len([t for t in self.tasks.values() if t.status == "executing"]),
            "completed_tasks": len([t for t in self.tasks.values() if t.status == "completed"]),
            "pending_tasks": len([t for t in self.tasks.values() if t.status == "pending"]),
            "recent_tools": [asdict(c) for c in self.tool_calls[-5:]] if self.tool_calls else [],
        }


class AgentLoopBase:
    """
    Base agent loop implementing TinyAGI's autonomous loop concept
    with Hermes-style reasoning and planning
    """

    def __init__(self, name: str = "UnifiedAgent"):
        self.name = name
        self.state = AgentState.IDLE
        self.memory = AgentMemory()
        self.tools: Dict[str, Callable] = {}
        self.running = False
        self.logger = logger

    def register_tool(self, name: str, tool: Callable, description: str = "") -> None:
        """Register a tool for the agent to use"""
        self.tools[name] = tool
        logger.info(f"Tool registered: {name}")

    def get_tools(self) -> Dict[str, str]:
        """Get available tools"""
        return {name: self.tools[name].__doc__ or "No description" for name in self.tools.keys()}

    async def perceive(self) -> Dict[str, Any]:
        """
        Perception phase: Gather current state and context
        Based on Hermes context handling
        """
        self.state = AgentState.REASONING
        perception = {
            "timestamp": datetime.now().isoformat(),
            "memory": self.memory.get_context(),
            "available_tools": list(self.tools.keys()),
            "state": self.state.value,
        }
        logger.info(f"Perception complete: {len(perception['available_tools'])} tools available")
        return perception

    async def plan(self, context: Dict[str, Any]) -> List[str]:
        """
        Planning phase: Decide what to do next
        Based on Hermes planning logic
        """
        self.state = AgentState.PLANNING
        plan = []

        # Get pending tasks
        pending_tasks = [t for t in self.memory.tasks.values() if t.status == "pending"]

        if pending_tasks:
            # Sort by priority (higher first)
            pending_tasks.sort(key=lambda t: t.priority, reverse=True)

            for task in pending_tasks[:3]:  # Plan next 3 tasks
                plan.append(f"Execute task: {task.id}")

        logger.info(f"Plan created with {len(plan)} steps")
        return plan

    async def execute_tool(self, tool_name: str, args: Dict[str, Any]) -> ToolCall:
        """
        Execute a registered tool
        """
        self.state = AgentState.EXECUTING

        call = ToolCall(tool_name=tool_name, args=args)
        start_time = time.time()

        try:
            if tool_name not in self.tools:
                raise ValueError(f"Tool not found: {tool_name}")

            tool = self.tools[tool_name]

            # Execute tool
            if asyncio.iscoroutinefunction(tool):
                result = await tool(**args)
            else:
                result = tool(**args)

            call.result = result
            call.execution_time = time.time() - start_time

            logger.info(f"Tool executed: {tool_name} ({call.execution_time:.2f}s)")

        except Exception as e:
            call.error = str(e)
            call.execution_time = time.time() - start_time
            logger.error(f"Tool execution failed: {tool_name} - {e}")

        self.memory.add_tool_call(call)
        return call

    async def reason(self, perception: Dict[str, Any], plan: List[str]) -> Dict[str, Any]:
        """
        Reasoning phase: Analyze situation and make decisions
        Based on Hermes reasoning framework
        """
        self.state = AgentState.REASONING

        reasoning = {
            "timestamp": datetime.now().isoformat(),
            "available_actions": len(self.tools),
            "pending_tasks": len([t for t in self.memory.tasks.values() if t.status == "pending"]),
            "next_action": plan[0] if plan else "idle",
            "reasoning": "Evaluating available tasks and tools",
        }

        logger.info(f"Reasoning complete: next action = {reasoning['next_action']}")
        return reasoning

    async def step(self) -> Dict[str, Any]:
        """
        One iteration of the agent loop:
        1. Perceive current state
        2. Plan next actions
        3. Reason about decisions
        4. Execute actions
        """
        try:
            # Perception
            perception = await self.perceive()

            # Planning
            plan = await self.plan(perception)

            # Reasoning
            reasoning = await self.reason(perception, plan)

            # Execution (if there's a plan)
            results = []
            if plan:
                for action in plan:
                    logger.info(f"Executing: {action}")
                    # Parse action and execute corresponding tool
                    # This is simplified - real implementation would be more sophisticated
                    results.append({"action": action, "status": "executed"})

            self.state = AgentState.IDLE

            return {
                "success": True,
                "perception": perception,
                "plan": plan,
                "reasoning": reasoning,
                "results": results,
            }

        except Exception as e:
            self.state = AgentState.ERROR
            logger.error(f"Agent step failed: {e}")
            return {
                "success": False,
                "error": str(e),
            }

    async def run(self, max_iterations: int = 10) -> None:
        """
        Run the agent loop for a specified number of iterations
        """
        self.running = True
        logger.info(f"Starting agent loop: {self.name} (max {max_iterations} iterations)")

        for i in range(max_iterations):
            if not self.running:
                break

            logger.info(f"\n--- Agent Loop Iteration {i + 1}/{max_iterations} ---")
            result = await self.step()

            if not result.get("success"):
                logger.error(f"Step failed: {result.get('error')}")
                break

            # Small delay between steps
            await asyncio.sleep(0.5)

        self.running = False
        logger.info("Agent loop completed")

    def stop(self) -> None:
        """Stop the agent loop"""
        self.running = False
        logger.info("Agent stop requested")

    def get_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return {
            "name": self.name,
            "state": self.state.value,
            "running": self.running,
            "tools_count": len(self.tools),
            "tasks_total": len(self.memory.tasks),
            "memory": self.memory.get_context(),
        }
