import { test } from "node:test";
import assert from "node:assert";
import OmniAgent from "../src/agent/omnigent.js";

test("OmniAgent - Initialization", async (t) => {
  const agent = new OmniAgent({
    apiKey: process.env.ANTHROPIC_API_KEY || "test-key",
  });

  const result = await agent.initialize();
  assert.strictEqual(result, true);
});

test("OmniAgent - Capabilities", async (t) => {
  const agent = new OmniAgent();
  const capabilities = agent.getCapabilities();

  assert.strictEqual(capabilities.github, true);
  assert.strictEqual(capabilities.codeGeneration, true);
  assert.strictEqual(capabilities.debugging, true);
});

test("OmniAgent - Conversation History", async (t) => {
  const agent = new OmniAgent();

  agent.conversationHistory = [
    { role: "user", content: "Hello" },
  ];

  assert.strictEqual(agent.conversationHistory.length, 1);

  agent.clearHistory();
  assert.strictEqual(agent.conversationHistory.length, 0);
});

export default { test };
