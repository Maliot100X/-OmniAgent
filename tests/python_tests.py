#!/usr/bin/env python3
"""
Comprehensive test suite for Unified AI Agent
Tests all commands and functionality
"""

import pytest
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from core.agent_loop import AgentLoopBase, AgentState, Task
from commands.registry import CommandRegistry, CommandType
from commands.executor import CommandExecutor
from integrations.llm_providers import AnthropicProvider, OpenAIProvider, LocalLLMProvider, LLMManager
from tools import unified_tools


# ============ CORE AGENT LOOP TESTS ============

@pytest.mark.asyncio
async def test_agent_initialization():
    """Test agent initialization"""
    agent = AgentLoopBase("TestAgent")
    assert agent.name == "TestAgent"
    assert agent.state == AgentState.IDLE
    assert len(agent.tools) == 0
    print("✓ Agent initialization test passed")


@pytest.mark.asyncio
async def test_register_tool():
    """Test tool registration"""
    agent = AgentLoopBase()

    async def dummy_tool():
        return {"result": "success"}

    agent.register_tool("dummy", dummy_tool, "A dummy tool")
    assert "dummy" in agent.tools
    tools = agent.get_tools()
    assert "dummy" in tools
    print("✓ Tool registration test passed")


@pytest.mark.asyncio
async def test_agent_memory():
    """Test agent memory"""
    agent = AgentLoopBase()
    task = Task(id="task1", description="Test task", priority=1)
    agent.memory.add_task(task)
    assert "task1" in agent.memory.tasks
    
    agent.memory.update_task("task1", "completed", result={"status": "done"})
    assert agent.memory.tasks["task1"].status == "completed"
    print("✓ Agent memory test passed")


@pytest.mark.asyncio
async def test_agent_step():
    """Test single agent loop step"""
    agent = AgentLoopBase()
    result = await agent.step()
    assert result["success"] == True
    assert "perception" in result
    assert "plan" in result
    assert "reasoning" in result
    print("✓ Agent step test passed")


# ============ COMMAND REGISTRY TESTS ============

def test_command_registry_registration():
    """Test command registration"""
    registry = CommandRegistry()

    async def test_handler():
        return {"status": "ok"}

    cmd = registry.register(
        "test_cmd",
        "Test command",
        test_handler,
        category=CommandType.TOOL,
        source="test",
    )
    
    assert cmd.name == "test_cmd"
    assert cmd.source == "test"
    assert registry.get_command("test_cmd") is not None
    print("✓ Command registration test passed")


def test_list_commands():
    """Test listing commands"""
    registry = CommandRegistry()

    async def handler1():
        return {}

    async def handler2():
        return {}

    registry.register("cmd1", "Command 1", handler1, source="project1")
    registry.register("cmd2", "Command 2", handler2, source="project2")

    all_cmds = registry.list_commands()
    assert len(all_cmds) == 2

    proj1_cmds = registry.list_commands(source="project1")
    assert len(proj1_cmds) == 1
    print("✓ List commands test passed")


def test_search_commands():
    """Test command search"""
    registry = CommandRegistry()

    async def generate_handler():
        return {}

    async def analyze_handler():
        return {}

    registry.register("generate_code", "Generate code", generate_handler)
    registry.register("analyze_data", "Analyze data", analyze_handler)

    results = registry.search_commands("generate")
    assert len(results) == 1
    assert results[0]["name"] == "generate_code"
    print("✓ Command search test passed")


# ============ COMMAND EXECUTOR TESTS ============

@pytest.mark.asyncio
async def test_executor_execute():
    """Test command execution"""
    registry = CommandRegistry()

    async def success_handler(value: str = "default"):
        return {"result": value}

    registry.register("test_cmd", "Test", success_handler)
    executor = CommandExecutor(registry)

    result = await executor.execute("test_cmd", {"value": "test"})
    assert result["success"] == True
    assert result["result"]["result"] == "test"
    print("✓ Executor execute test passed")


@pytest.mark.asyncio
async def test_executor_batch():
    """Test batch execution"""
    registry = CommandRegistry()

    async def cmd1_handler():
        return {"id": 1}

    async def cmd2_handler():
        return {"id": 2}

    registry.register("cmd1", "Command 1", cmd1_handler)
    registry.register("cmd2", "Command 2", cmd2_handler)

    executor = CommandExecutor(registry)
    
    commands = [
        {"name": "cmd1", "args": {}},
        {"name": "cmd2", "args": {}},
    ]

    results = await executor.execute_batch(commands)
    assert len(results) == 2
    assert all(r["success"] for r in results)
    print("✓ Batch execution test passed")


# ============ UNIFIED TOOLS TESTS ============

@pytest.mark.asyncio
async def test_openclaw_tools():
    """Test OpenClaw tools"""
    result = await unified_tools.execute_workflow("test_workflow", {"param1": "value1"})
    assert "workflow" in result
    assert result["status"] == "executing"

    agents = await unified_tools.list_agents()
    assert "agents" in agents
    assert agents["total"] > 0

    agent = await unified_tools.create_agent("TestAgent", "executor", {})
    assert agent["name"] == "TestAgent"
    print("✓ OpenClaw tools test passed")


@pytest.mark.asyncio
async def test_tinyagi_tools():
    """Test TinyAGI tools"""
    team = await unified_tools.create_team("TestTeam", ["agent1", "agent2"])
    assert team["team_name"] == "TestTeam"
    assert len(team["members"]) == 2

    task = await unified_tools.add_task_to_queue("TestTask", "Do something", priority=1)
    assert task["name"] == "TestTask"
    assert task["status"] == "queued"

    status = await unified_tools.get_team_status("TestTeam")
    assert status["team_name"] == "TestTeam"
    print("✓ TinyAGI tools test passed")


@pytest.mark.asyncio
async def test_hermes_tools():
    """Test Hermes tools"""
    reasoning = await unified_tools.reason_about_task("Analyze this task", {"context": "data"})
    assert "reasoning_type" in reasoning
    assert "analysis" in reasoning

    plan = await unified_tools.plan_execution("Complete the goal", ["tool1", "tool2"])
    assert "plan" in plan
    assert len(plan["plan"]) > 0

    context = await unified_tools.get_reasoning_context("task_planning")
    assert "context" in context
    print("✓ Hermes tools test passed")


@pytest.mark.asyncio
async def test_claude_code_tools():
    """Test Claude Code tools"""
    code = await unified_tools.generate_code("Create a hello world function", "python")
    assert "code" in code
    assert code["language"] == "python"

    analysis = await unified_tools.analyze_code("x = 1", "python")
    assert "analysis" in analysis

    debug = await unified_tools.debug_code("x = y", "undefined variable", "python")
    assert "root_cause" in debug
    assert "fix" in debug

    tests = await unified_tools.generate_tests("def add(a, b): return a + b", "python")
    assert "test_cases" in tests
    assert len(tests["test_cases"]) > 0

    refactored = await unified_tools.refactor_code("x=1;y=2;z=x+y", "readability")
    assert "refactored_code" in refactored
    print("✓ Claude Code tools test passed")


@pytest.mark.asyncio
async def test_custom_tools():
    """Test custom tools"""
    result = await unified_tools.file_read(__file__)
    assert result["status"] == "success"
    assert result["size"] > 0

    result = await unified_tools.json_parse('{"key": "value"}')
    assert result["status"] == "success"
    assert result["data"]["key"] == "value"
    print("✓ Custom tools test passed")


# ============ LLM PROVIDER TESTS ============

def test_llm_manager():
    """Test LLM manager"""
    manager = LLMManager()

    # Register providers
    anthropic = AnthropicProvider(api_key="test-key")
    manager.register_provider("anthropic", anthropic, set_default=True)

    assert "anthropic" in manager.providers
    assert manager.default_provider == "anthropic"

    providers = manager.list_providers()
    assert "anthropic" in providers
    print("✓ LLM manager test passed")


# ============ INTEGRATION TESTS ============

@pytest.mark.asyncio
async def test_full_workflow():
    """Test complete workflow"""
    # Initialize agent
    agent = AgentLoopBase("TestAgent")

    # Register tools
    async def task_handler(task_name: str):
        return {"task": task_name, "completed": True}

    agent.register_tool("execute_task", task_handler)

    # Create registry and register command
    registry = CommandRegistry()
    registry.register("test_task", "Test task", task_handler)

    # Execute command
    executor = CommandExecutor(registry)
    result = await executor.execute("test_task", {"task_name": "test"})

    assert result["success"] == True
    print("✓ Full workflow integration test passed")


def run_all_tests():
    """Run all tests"""
    print("\n" + "=" * 70)
    print("🧪 RUNNING COMPREHENSIVE TESTS")
    print("=" * 70 + "\n")

    pytest.main([__file__, "-v", "-s"])


if __name__ == "__main__":
    run_all_tests()
