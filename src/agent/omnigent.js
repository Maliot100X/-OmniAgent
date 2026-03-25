import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { resolve } from "path";
import TinyAGIAgent from "../integrations/tinyagi.js";
import HermesAgent from "../integrations/hermes.js";
import OpenClawOrchestrator from "../integrations/openclaw.js";
import ClaudeCodeEngine from "../integrations/claude-code.js";

const configPath = resolve("./config/omnigent.yaml");
const config = JSON.parse(readFileSync("./config/config.json"));

export class OmniAgent {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = options.model || "claude-3-5-sonnet-20241022";
    this.client = new Anthropic({ apiKey: this.apiKey });
    this.conversationHistory = [];
    
    // Initialize all integrated modules
    this.tinyagi = new TinyAGIAgent({ name: "OmniTinyAGI" });
    this.hermes = new HermesAgent({ name: "OmniHermes" });
    this.openclaw = new OpenClawOrchestrator({ name: "OmniOpenClaw" });
    this.claudeCode = new ClaudeCodeEngine({ apiKey: this.apiKey, model: this.model });
    
    this.capabilities = {
      github: true,
      codeGeneration: true,
      debugging: true,
      orchestration: true,
      multiAgent: true,
      tinyagi: true,
      hermes: true,
      openclaw: true,
      claudeCode: true,
    };
  }

  async initialize() {
    console.log("🚀 OmniAgent Initializing...");
    console.log(`✓ Model: ${this.model}`);
    console.log(`✓ Capabilities: ${Object.keys(this.capabilities).join(", ")}`);
    
    // Initialize all integrated modules
    await this.tinyagi.initialize();
    await this.hermes.initialize();
    await this.openclaw.initialize();
    await this.claudeCode.initialize();
    
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

  // ============ TinyAGI Methods ============
  createTeam(teamName, agents = []) {
    return this.tinyagi.createTeam(teamName, agents);
  }

  registerCollaborator(agentName, capabilities = []) {
    return this.tinyagi.registerCollaborator(agentName, capabilities);
  }

  addTask(taskName, instructions, priority = "normal") {
    return this.tinyagi.addTask(taskName, instructions, priority);
  }

  async executeTasks() {
    return this.tinyagi.executeTasks();
  }

  broadcastMessage(message, data = {}) {
    return this.tinyagi.broadcastMessage(message, data);
  }

  // ============ Hermes Methods ============
  registerProtocol(protocolName, handlers = {}) {
    return this.hermes.registerProtocol(protocolName, handlers);
  }

  registerAgent(agentName, agentConfig = {}) {
    return this.hermes.registerAgent(agentName, agentConfig);
  }

  discoverAgents(filter = {}) {
    return this.hermes.discoverAgents(filter);
  }

  async routeMessage(targetAgent, message, payload = {}) {
    return this.hermes.routeMessage(targetAgent, message, payload);
  }

  getAgentInfo(agentName) {
    return this.hermes.getAgentInfo(agentName);
  }

  listHermesAgents() {
    return this.hermes.listAgents();
  }

  // ============ OpenClaw Methods ============
  registerExecutor(executorName, executor) {
    return this.openclaw.registerExecutor(executorName, executor);
  }

  createWorkflow(workflowName, steps = []) {
    return this.openclaw.createWorkflow(workflowName, steps);
  }

  addStep(workflowId, stepName, action, params = {}) {
    return this.openclaw.addStep(workflowId, stepName, action, params);
  }

  async executeWorkflow(workflowId, retryCount = 3) {
    return this.openclaw.executeWorkflow(workflowId, retryCount);
  }

  enqueueWorkflow(workflowId, priority = "normal") {
    return this.openclaw.enqueueWorkflow(workflowId, priority);
  }

  async processQueue() {
    return this.openclaw.processQueue();
  }

  listWorkflows() {
    return this.openclaw.listWorkflows();
  }

  // ============ Claude Code Methods ============
  async generateCode(requirement, language = "javascript") {
    return this.claudeCode.generateCode(requirement, language);
  }

  async analyzeCode(code, language = "javascript") {
    return this.claudeCode.analyzeCode(code, language);
  }

  async debugCode(code, errorMessage, language = "javascript") {
    return this.claudeCode.debugCode(code, errorMessage, language);
  }

  async generateDocumentation(code, language = "javascript") {
    return this.claudeCode.generateDocumentation(code, language);
  }

  async generateTests(code, language = "javascript") {
    return this.claudeCode.generateTests(code, language);
  }

  async refactorCode(code, language = "javascript", goal = "readability") {
    return this.claudeCode.refactorCode(code, language, goal);
  }

  storeCode(name, code, metadata = {}) {
    return this.claudeCode.storeInLibrary(name, code, metadata);
  }

  // ============ Agent Statistics ============
  getFullStats() {
    return {
      omnigent: {
        model: this.model,
        capabilities: this.capabilities,
      },
      tinyagi: this.tinyagi.getStats(),
      hermes: this.hermes.getRegistry(),
      openclaw: this.openclaw.getStats(),
      claudeCode: this.claudeCode.getStats(),
    };
  }
}

export default OmniAgent;
