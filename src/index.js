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
      case "exit":
      case "quit":
        console.log("👋 Goodbye!");
        process.exit(0);
        break;
      default:
        console.log("❓ Unknown command. Type 'help' for available commands.");
    }
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
║          🌟 OmniAgent - Universal AI Framework 🌟         ║
╚════════════════════════════════════════════════════════════╝

📋 AVAILABLE COMMANDS:

  ask <question>
    → Ask OmniAgent anything. Full multi-provider AI support.
    → Example: ask How do I implement a React hook?

  repo <action> [params]
    → create <name> [description]  - Create a GitHub repository
    → clone <url> [target]         - Clone a repository
    → info <owner> <repo>          - Get repository information

  push [message]
    → Push all changes with optional commit message
    → Default message: "Update from OmniAgent"

  status
    → Show current status (auth, branch, recent commits)

  gh <command>
    → Execute raw GitHub CLI commands
    → Example: gh pr list --state open

  help
    → Show this help menu

  exit / quit
    → Exit OmniAgent

════════════════════════════════════════════════════════════

💡 AGENT CAPABILITIES:
   ✓ GitHub Integration    ✓ Code Generation
   ✓ Agent Orchestration   ✓ Multi-Provider AI
   ✓ Debugging Support     ✓ Full CLI Support

════════════════════════════════════════════════════════════
    `);
  }
}

export default OmniAgentFramework;
