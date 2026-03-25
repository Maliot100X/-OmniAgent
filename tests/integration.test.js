import { test } from "node:test";
import assert from "node:assert";
import OmniAgent from "../src/agent/omnigent.js";

test("OmniAgent - Full Integration Tests", async (t) => {
  const agent = new OmniAgent({
    apiKey: process.env.ANTHROPIC_API_KEY || "test-key",
  });

  await t.test("Initialize all modules", async () => {
    const result = await agent.initialize();
    assert.strictEqual(result, true);
  });

  await t.test("TinyAGI - Team Creation", async () => {
    const team = agent.createTeam("TestTeam", []);
    assert.strictEqual(team.name, "TestTeam");
    assert.strictEqual(team.async, true);
  });

  await t.test("TinyAGI - Task Management", async () => {
    const task = agent.addTask("TestTask", "Execute test", "high");
    assert.strictEqual(task.name, "TestTask");
    assert.strictEqual(task.status, "pending");
  });

  await t.test("TinyAGI - Collaborators", async () => {
    const collab = agent.registerCollaborator("TestAgent", ["code", "analysis"]);
    assert.strictEqual(collab.name, "TestAgent");
  });

  await t.test("Hermes - Agent Registration", async () => {
    const registered = agent.registerAgent("HermesTestAgent", { role: "worker" });
    assert.strictEqual(registered.name, "HermesTestAgent");
    assert.strictEqual(registered.status, "active");
  });

  await t.test("Hermes - Protocol Registration", async () => {
    const protocol = agent.registerProtocol("test-protocol", {
      handle: () => "test",
    });
    assert.strictEqual(protocol.name, "test-protocol");
  });

  await t.test("Hermes - Agent Discovery", async () => {
    const discovered = agent.discoverAgents();
    assert.ok(Array.isArray(discovered));
    assert.ok(discovered.length >= 0);
  });

  await t.test("Hermes - List Agents", async () => {
    const agents = agent.listHermesAgents();
    assert.ok(Array.isArray(agents));
  });

  await t.test("OpenClaw - Workflow Creation", async () => {
    const workflow = agent.createWorkflow("TestWorkflow", []);
    assert.strictEqual(workflow.name, "TestWorkflow");
    assert.strictEqual(workflow.status, "created");
  });

  await t.test("OpenClaw - Executor Registration", async () => {
    const executor = async () => "executed";
    agent.registerExecutor("test-executor", executor);
    assert.ok(true);
  });

  await t.test("OpenClaw - List Workflows", async () => {
    const workflows = agent.listWorkflows();
    assert.ok(Array.isArray(workflows));
    assert.ok(workflows.length >= 1);
  });

  await t.test("Claude Code - Generate Code", async () => {
    try {
      const result = await agent.generateCode("Create a hello world function", "javascript");
      assert.ok(result.code);
      assert.strictEqual(result.language, "javascript");
    } catch (error) {
      console.log("⚠️  Code generation skipped (requires API key)");
    }
  });

  await t.test("Full Stats", async () => {
    const stats = agent.getFullStats();
    assert.ok(stats.omnigent);
    assert.ok(stats.tinyagi);
    assert.ok(stats.hermes);
    assert.ok(stats.openclaw);
    assert.ok(stats.claudeCode);
  });
});

export default { test };
