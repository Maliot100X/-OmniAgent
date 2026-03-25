import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { resolve } from "path";

const configPath = resolve("./config/omnigent.yaml");
const config = JSON.parse(readFileSync("./config/config.json"));

export class OmniAgent {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = options.model || "claude-3-5-sonnet-20241022";
    this.client = new Anthropic({ apiKey: this.apiKey });
    this.conversationHistory = [];
    this.capabilities = {
      github: true,
      codeGeneration: true,
      debugging: true,
      orchestration: true,
      multiAgent: true,
    };
  }

  async initialize() {
    console.log("🚀 OmniAgent Initializing...");
    console.log(`✓ Model: ${this.model}`);
    console.log(`✓ Capabilities: ${Object.keys(this.capabilities).join(", ")}`);
    return true;
  }

  async query(userMessage, systemPrompt = null) {
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    const messages = this.conversationHistory;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system:
          systemPrompt ||
          `You are OmniAgent, a universal AI assistant combining:
- OpenClaw agent orchestration
- TinyAGI lightweight reasoning
- Hermes agent protocols
- Claude code capabilities

You have access to GitHub CLI commands and can help with:
1. Code generation and analysis
2. GitHub repository management
3. Agent orchestration tasks
4. Multi-provider AI integration
5. Debugging and troubleshooting`,
        messages,
      });

      const assistantMessage =
        response.content[0].type === "text" ? response.content[0].text : "";

      this.conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      return {
        response: assistantMessage,
        usage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error("❌ Agent Error:", error.message);
      throw error;
    }
  }

  async executePlan(plan) {
    console.log("📋 Executing Plan:", plan.name);
    for (const step of plan.steps) {
      console.log(`→ ${step.description}`);
      const result = await this.query(step.instruction);
      console.log(`✓ Result:`, result.response.substring(0, 100) + "...");
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getCapabilities() {
    return this.capabilities;
  }
}

export default OmniAgent;
