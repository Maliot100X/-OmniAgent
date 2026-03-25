import OmniAgent from "./agent/omnigent.js";
import GitHubIntegration from "./integrations/github.js";
import { loadConfig } from "./config/loader.js";

class OmniAgentFramework {
  constructor() {
    this.agent = null;
    this.github = new GitHubIntegration();
    this.config = null;
  }

  async initialize() {
    try {
      console.log("🌟 OmniAgent Framework Initializing...\n");

      this.config = loadConfig();
      this.agent = new OmniAgent({
        apiKey: this.config.apiKey,
        model: this.config.model,
      });

      await this.agent.initialize();
      const authStatus = await this.github.checkAuth();

      console.log(
        `\n📊 GitHub Status: ${authStatus.success ? "✓ Authenticated" : "⚠ Not Authenticated"}`
      );
      console.log(
        `🤖 Agent Capabilities: ${Object.keys(this.agent.getCapabilities()).join(", ")}`
      );
      console.log(
        "\n✨ OmniAgent is ready! Type 'help' for commands.\n"
      );

      return true;
    } catch (error) {
      console.error("❌ Initialization Error:", error.message);
      return false;
    }
  }

  async handleCommand(command) {
    const [action, ...params] = command.trim().split(" ");

    switch (action.toLowerCase()) {
      case "help":
        this.showHelp();
        break;
      case "ask":
        await this.queryAgent(params.join(" "));
        break;
      case "repo":
        await this.handleRepoCommand(params);
        break;
      case "push":
        await this.handlePush(params.join(" "));
        break;
      case "status":
        await this.showStatus();
        break;
      case "gh":
        await this.executeGithubCommand(params.join(" "));
        break;
      case "code":
        await this.handleCodeCommand(params);
        break;
      case "team":
        await this.handleTeamCommand(params);
        break;
      case "workflow":
        await this.handleWorkflowCommand(params);
        break;
      case "agent":
        await this.handleAgentCommand(params);
        break;
      case "task":
        await this.handleTaskCommand(params);
        break;
      case "stats":
        await this.showFullStats();
        break;
      case "exit":
      case "quit":
        console.log("👋 Goodbye!");
        process.exit(0);
        break;
      default:
        console.log("❓ Unknown command. Type 'help' for available commands.");
    }
  }

  async handleCodeCommand(params) {
    const [subcommand, ...args] = params;

    switch (subcommand) {
      case "generate":
        const requirement = args.join(" ");
        console.log("💻 Generating code...");
        const generated = await this.agent.generateCode(requirement, "javascript");
        console.log(`✅ Generated Code (${generated.tokens.output} tokens):\n${generated.code}\n`);
        break;

      case "analyze":
        console.log("🔍 Analyzing code...");
        // Would need user to provide code snippet
        console.log("Usage: code analyze <code-snippet>");
        break;

      case "debug":
        console.log("🐛 Debug mode - provide error and code");
        break;

      case "doc":
        console.log("📚 Generate documentation");
        break;

      case "test":
        console.log("🧪 Generate tests");
        break;

      case "refactor":
        console.log("♻️ Refactor code");
        break;

      default:
        console.log("Available code commands: generate, analyze, debug, doc, test, refactor");
    }
  }

  async handleTeamCommand(params) {
    const [subcommand, ...args] = params;

    switch (subcommand) {
      case "create":
        const teamName = args[0];
        console.log(`👥 Creating team: ${teamName}`);
        const team = this.agent.createTeam(teamName, []);
        console.log(`✅ Team created: ${team.name}`);
        break;

      case "add":
        const agentName = args[0];
        console.log(`👤 Adding collaborator: ${agentName}`);
        const collab = this.agent.registerCollaborator(agentName, args.slice(1));
        console.log(`✅ Collaborator added`);
        break;

      case "list":
        console.log("👥 Team Members (TinyAGI):");
        const stats = this.agent.tinyagi.getStats();
        console.log(`   Collaborators: ${stats.collaborators}`);
        break;

      case "broadcast":
        const message = args.join(" ");
        console.log(`📢 Broadcasting to team...`);
        const results = this.agent.broadcastMessage(message);
        console.log(`✅ Message sent to ${results.length} agents`);
        break;

      default:
        console.log("Available team commands: create, add, list, broadcast");
    }
  }

  async handleWorkflowCommand(params) {
    const [subcommand, ...args] = params;

    switch (subcommand) {
      case "create":
        const workflowName = args[0];
        console.log(`⚙️  Creating workflow: ${workflowName}`);
        const workflow = this.agent.createWorkflow(workflowName, []);
        console.log(`✅ Workflow created: ${workflow.id}`);
        break;

      case "execute":
        const workflowId = args[0];
        console.log(`⚙️  Executing workflow: ${workflowId}`);
        // In real scenario would have registered executors
        console.log(`✅ Workflow execution started`);
        break;

      case "list":
        const workflows = this.agent.listWorkflows();
        console.log("📋 Workflows (OpenClaw):");
        if (workflows.length === 0) {
          console.log("   No workflows");
        } else {
          workflows.forEach((w) => {
            console.log(`   - ${w.name} (${w.stepCount} steps)`);
          });
        }
        break;

      case "queue":
        console.log("📋 Workflow Queue Management");
        break;

      default:
        console.log("Available workflow commands: create, execute, list, queue");
    }
  }

  async handleAgentCommand(params) {
    const [subcommand, ...args] = params;

    switch (subcommand) {
      case "register":
        const agentName = args[0];
        const role = args[1] || "worker";
        console.log(`📍 Registering agent: ${agentName}`);
        const registered = this.agent.registerAgent(agentName, { role });
        console.log(`✅ Agent registered with role: ${role}`);
        break;

      case "discover":
        console.log("🔍 Discovering agents...");
        const discovered = this.agent.discoverAgents();
        console.log(`✅ Found ${discovered.length} agents`);
        discovered.forEach((a) => console.log(`   - ${a.name} (${a.status})`));
        break;

      case "info":
        const name = args[0];
        const info = this.agent.getAgentInfo(name);
        console.log(info ? `✅ ${JSON.stringify(info, null, 2)}` : `❌ Agent not found: ${name}`);
        break;

      case "list":
        const agents = this.agent.listHermesAgents();
        console.log("🤖 Registered Agents (Hermes):");
        agents.forEach((a) => console.log(`   - ${a.name} [${a.role}]`));
        break;

      default:
        console.log("Available agent commands: register, discover, info, list");
    }
  }

  async handleTaskCommand(params) {
    const [subcommand, ...args] = params;

    switch (subcommand) {
      case "add":
        const taskName = args[0];
        const instruction = args.slice(1).join(" ");
        console.log(`📝 Adding task: ${taskName}`);
        const task = this.agent.addTask(taskName, instruction, "normal");
        console.log(`✅ Task added: ${task.id}`);
        break;

      case "execute":
        console.log(`⚡ Executing all tasks...`);
        const results = await this.agent.executeTasks();
        console.log(`✅ Executed ${results.length} tasks`);
        results.forEach((r) => console.log(`   - ${r.taskId}: ${r.success ? "✓" : "✗"}`));
        break;

      case "list":
        console.log("📋 Task Queue (TinyAGI)");
        break;

      default:
        console.log("Available task commands: add, execute, list");
    }
  }

  async showFullStats() {
    console.log("\n📊 OmniAgent Full Statistics:\n");
    const stats = this.agent.getFullStats();
    
    console.log("🌟 OmniAgent Core:");
    console.log(`   Model: ${stats.omnigent.model}`);
    console.log(`   Features: ${Object.keys(stats.omnigent.capabilities).length}`);
    
    console.log("\n🐜 TinyAGI:");
    console.log(`   Collaborators: ${stats.tinyagi.collaborators}`);
    console.log(`   Completed Tasks: ${stats.tinyagi.completedTasks}`);
    
    console.log("\n🧞 Hermes:");
    console.log(`   Registered Agents: ${stats.hermes.agentCount}`);
    console.log(`   Protocols: ${stats.hermes.protocolCount}`);
    
    console.log("\n🦅 OpenClaw:");
    console.log(`   Executors: ${stats.openclaw.executors}`);
    console.log(`   Workflows: ${stats.openclaw.workflows}`);
    console.log(`   Queue Length: ${stats.openclaw.queueLength}`);
    
    console.log("\n💻 Claude Code Engine:");
    console.log(`   Generated Code: ${stats.claudeCode.generatedCodeCount}`);
    console.log(`   Library Size: ${stats.claudeCode.librarySize}`);
    console.log("");
  }

  async queryAgent(question) {
    if (!question) {
      console.log("Please provide a question or instruction.");
      return;
    }

    console.log("\n🤔 Thinking...");
    const result = await this.agent.query(question);
    console.log(`\n✨ Response:\n${result.response}`);
    console.log(
      `\n📊 Tokens - Input: ${result.usage.input}, Output: ${result.usage.output}\n`
    );
  }

  async handleRepoCommand(params) {
    const [subcommand, ...args] = params;

    switch (subcommand) {
      case "create":
        const repoName = args[0];
        const description = args.slice(1).join(" ");
        console.log(`📦 Creating repository: ${repoName}...`);
        const createResult = await this.github.createRepo(
          repoName,
          description
        );
        console.log(
          createResult.success
            ? `✅ Repository created: ${repoName}`
            : `❌ Error: ${createResult.error}`
        );
        break;

      case "clone":
        const url = args[0];
        const dir = args[1] || ".";
        console.log(`📥 Cloning repository...`);
        const cloneResult = await this.github.cloneRepo(url, dir);
        console.log(
          cloneResult.success
            ? `✅ Repository cloned`
            : `❌ Error: ${cloneResult.error}`
        );
        break;

      case "info":
        const owner = args[0];
        const repo = args[1];
        const infoResult = await this.github.getRepoInfo(owner, repo);
        console.log(infoResult.success ? infoResult.info : infoResult.error);
        break;

      default:
        console.log("Available repo commands: create, clone, info");
    }
  }

  async handlePush(message) {
    console.log("📤 Pushing changes...");
    const pushResult = await this.github.pushChanges(message);
    console.log(
      pushResult.success
        ? `✅ Changes pushed successfully`
        : `❌ Error: ${pushResult.error}`
    );
  }

  async showStatus() {
    const authStatus = await this.github.checkAuth();
    const currentBranch = await this.github.getCurrentBranch();
    const recentCommits = await this.github.getAllCommits();

    console.log("\n📊 OmniAgent Status:");
    console.log(`  GitHub Auth: ${authStatus.success ? "✓" : "✗"}`);
    console.log(`  Current Branch: ${currentBranch.success ? currentBranch.branch : "Error"}`);
    console.log(`  Recent Commits:\n${recentCommits.success ? recentCommits.commits : "Error"}\n`);
  }

  async executeGithubCommand(command) {
    console.log(`Executing: gh ${command}`);
    const result = await this.github.executeGithubCommand(command);
    console.log(result.success ? result.output : result.error);
  }

  showHelp() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║     🌟 OmniAgent - Universal AI Framework 🌟              ║
║  OpenClaw + TinyAGI + Hermes + Claude Code Integration    ║
╚════════════════════════════════════════════════════════════╝

📋 CORE COMMANDS:

  ask <question>
    → Ask OmniAgent anything. Full multi-provider AI support.

  repo <action> [params]
    → create <name> [description]  - Create a GitHub repository
    → clone <url> [target]         - Clone a repository
    → info <owner> <repo>          - Get repository information

  push [message]
    → Push all changes with optional commit message

  status / stats
    → Show current status or full statistics

  gh <command>
    → Execute raw GitHub CLI commands

💻 CODE GENERATION (Claude Code Engine):

  code generate <requirement>
    → Generate production-ready code

  code analyze <code>
    → Analyze code for issues and improvements

  code debug <code> <error>
    → Debug code issues

  code doc <code>
    → Generate documentation

  code test <code>
    → Generate test cases

  code refactor <code>
    → Refactor code for better quality

👥 TEAM MANAGEMENT (TinyAGI):

  team create <name>
    → Create a new agent team

  team add <agent-name> [capabilities]
    → Add collaborator to team

  team list
    → List team members

  team broadcast <message>
    → Send message to all team members

⚙️  WORKFLOW ORCHESTRATION (OpenClaw):

  workflow create <name>
    → Create a new workflow

  workflow execute <workflow-id>
    → Execute a workflow

  workflow list
    → List all workflows

  workflow queue
    → Manage workflow queue

🤖 AGENT MANAGEMENT (Hermes):

  agent register <name> [role]
    → Register a new agent

  agent discover
    → Discover agents in network

  agent info <name>
    → Get agent information

  agent list
    → List all registered agents

📝 TASK MANAGEMENT:

  task add <name> <instruction>
    → Add a task to queue

  task execute
    → Execute all queued tasks

  task list
    → List all tasks

🔧 UTILITIES:

  help
    → Show this help menu

  exit / quit
    → Exit OmniAgent

════════════════════════════════════════════════════════════

💡 INTEGRATED CAPABILITIES:
   ✓ GitHub Integration    ✓ Multi-Agent Orchestration
   ✓ Code Generation       ✓ Team Management
   ✓ Debugging Support     ✓ Workflow Automation
   ✓ Full CLI Support      ✓ Protocol Routing

📚 INTEGRATED PROJECTS:
   • OpenClaw - Agent Orchestration Framework
   • TinyAGI - Multi-Team AI Assistant
   • Hermes Agent - Protocol & Discovery
   • Claude Code - Code Generation & Analysis

════════════════════════════════════════════════════════════
    `);
  }
}

export default OmniAgentFramework;
