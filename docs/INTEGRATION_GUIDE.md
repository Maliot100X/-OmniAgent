# OmniAgent - Complete Integration Guide

## Overview

**OmniAgent** is a unified AI agent framework that combines four powerful open-source projects:

1. **OpenClaw** - Agent orchestration and workflow execution
2. **TinyAGI** - Multi-team, multi-channel AI assistant
3. **Hermes Agent** - Advanced agent protocols and discovery
4. **Claude Code** - Code generation and analysis

## Architecture

```
OmniAgent (Main Framework)
├── TinyAGI Module (Multi-Agent Teams)
├── Hermes Module (Agent Registry & Protocols)
├── OpenClaw Module (Workflow Orchestration)
├── Claude Code Module (Code Generation)
└── GitHub Integration (Repository Management)
```

## Quick Start

### Installation

```bash
git clone https://github.com/Maliot100X/-OmniAgent.git
cd omnigent
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env and add your API keys
```

### Run OmniAgent

```bash
npm start
```

## Integrated Features

### 1. TinyAGI Integration

**Multi-Team, Multi-Channel AI Assistant**

```javascript
// Create a team
const team = agent.createTeam("DataAnalysis", []);

// Add collaborators
agent.registerCollaborator("DataProcessor", ["analysis", "reporting"]);
agent.registerCollaborator("Validator", ["validation", "quality"]);

// Add tasks
agent.addTask("ProcessData", "Analyze sales data for Q1", "high");
agent.addTask("GenerateReport", "Create quarterly report", "normal");

// Execute all tasks
const results = await agent.executeTasks();

// Broadcast to team
agent.broadcastMessage("Report ready for review", { reportId: 123 });
```

### 2. Hermes Agent Integration

**Advanced Agent Protocols & Discovery**

```javascript
// Register an agent
agent.registerAgent("DataAnalyzer", {
  role: "analyst",
  capabilities: ["analysis", "reporting"]
});

// Register protocol handlers
agent.registerProtocol("data-processing", {
  process: (data) => ({ processed: true }),
  validate: (data) => ({ valid: true })
});

// Discover agents
const agents = agent.discoverAgents({ role: "analyst" });

// Route messages
await agent.routeMessage("DataAnalyzer", "Analyze Q1 data", { 
  dataset: "sales_2024" 
});

// Get agent info
const info = agent.getAgentInfo("DataAnalyzer");
```

### 3. OpenClaw Integration

**Workflow Orchestration & Execution**

```javascript
// Create workflow
const workflow = agent.createWorkflow("DataPipeline", []);

// Register executors
agent.registerExecutor("fetch-data", async (params) => {
  // Fetch data from source
  return { rows: 1000 };
});

agent.registerExecutor("transform-data", async (params) => {
  // Transform data
  return { transformed: true };
});

// Add steps to workflow
agent.addStep(workflow.id, "Fetch", "fetch-data", { source: "api" });
agent.addStep(workflow.id, "Transform", "transform-data", { format: "csv" });

// Execute workflow with retry logic
await agent.executeWorkflow(workflow.id, 3);

// Queue workflows for batch processing
agent.enqueueWorkflow(workflow.id, "high");
await agent.processQueue();

// List workflows
const workflows = agent.listWorkflows();
```

### 4. Claude Code Integration

**AI-Powered Code Generation & Analysis**

```javascript
// Generate code
const codeResult = await agent.generateCode(
  "Create a function to validate email addresses",
  "javascript"
);
console.log(codeResult.code);

// Analyze code for issues
const analysis = await agent.analyzeCode(
  `function buggyCode(x) { return x = 5; }`,
  "javascript"
);
console.log(analysis.analysis);

// Debug code
const debug = await agent.debugCode(
  `const data = JSON.parse(jsonString);`,
  "Unexpected token in JSON",
  "javascript"
);
console.log(debug.debugSolution);

// Generate documentation
const docs = await agent.generateDocumentation(codeResult.code);
console.log(docs.documentation);

// Generate tests
const tests = await agent.generateTests(codeResult.code);
console.log(tests.testCode);

// Refactor code
const refactored = await agent.refactorCode(
  codeResult.code,
  "javascript",
  "performance"
);
console.log(refactored.refactoredCode);

// Store in library
agent.storeCode("email-validator", codeResult.code, {
  version: "1.0",
  tags: ["validation", "email"]
});
```

### 5. GitHub Integration

**Repository Management & Automation**

```javascript
// Create repository
const repo = await github.createRepo("my-project", "My awesome project");

// Clone repository
await github.cloneRepo("https://github.com/user/repo", "./repos/project");

// Branch management
await github.createBranch("feature/new-feature");
await github.switchBranch("feature/new-feature");

// Push changes
await github.pushChanges("Add new features and fixes");

// Create issues
await github.createIssue(
  "Bug: Login fails on mobile",
  "Login page crashes on mobile devices",
  ["bug", "urgent"]
);

// Create pull request
await github.createPullRequest(
  "Add dark mode support",
  "Implements dark mode toggle in settings",
  "main"
);

// List PRs and issues
const prs = await github.listPullRequests("open");
const issues = await github.listIssues("open");
```

## CLI Commands

### Core Commands

```bash
# Ask AI
OmniAgent> ask How do I implement authentication?

# Repository management
OmniAgent> repo create my-project
OmniAgent> repo clone https://github.com/user/repo
OmniAgent> push "Add new features"

# Status
OmniAgent> status
OmniAgent> stats
```

### Code Generation

```bash
OmniAgent> code generate "Create a REST API with Express"
OmniAgent> code analyze <code>
OmniAgent> code debug <code> <error>
OmniAgent> code doc <code>
OmniAgent> code test <code>
OmniAgent> code refactor <code>
```

### Team Management (TinyAGI)

```bash
OmniAgent> team create DataAnalysis
OmniAgent> team add DataProcessor analysis reporting
OmniAgent> team list
OmniAgent> team broadcast "Report ready"
```

### Workflow Orchestration (OpenClaw)

```bash
OmniAgent> workflow create DataPipeline
OmniAgent> workflow execute <workflow-id>
OmniAgent> workflow list
OmniAgent> workflow queue
```

### Agent Management (Hermes)

```bash
OmniAgent> agent register DataAnalyzer analyst
OmniAgent> agent discover
OmniAgent> agent list
OmniAgent> agent info DataAnalyzer
```

### Task Management

```bash
OmniAgent> task add ProcessData "Analyze Q1 data"
OmniAgent> task execute
OmniAgent> task list
```

## Programmatic Usage

```javascript
import OmniAgent from './src/agent/omnigent.js';

async function main() {
  const agent = new OmniAgent({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  await agent.initialize();

  // Use any integrated feature
  const team = agent.createTeam("MyTeam", []);
  const workflow = agent.createWorkflow("MyWorkflow", []);
  const code = await agent.generateCode("Build a todo app");

  // Get comprehensive stats
  const stats = agent.getFullStats();
  console.log(stats);
}

main().catch(console.error);
```

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test tests/integration.test.js
```

## Features & Capabilities

✅ **Multi-Team Orchestration** - TinyAGI  
✅ **Agent Registry & Discovery** - Hermes  
✅ **Workflow Execution with Retry** - OpenClaw  
✅ **AI Code Generation** - Claude Code  
✅ **GitHub Integration** - Full CLI support  
✅ **Interactive CLI** - Easy-to-use commands  
✅ **Comprehensive Testing** - 20+ test cases  
✅ **Production Ready** - Error handling and logging  

## Configuration

### Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
MODEL=claude-3-5-sonnet-20241022
DEBUG=false
```

### Config File

Edit `config/config.json`:

```json
{
  "apiKey": "your-key",
  "model": "claude-3-5-sonnet-20241022",
  "features": {
    "github": true,
    "codeGeneration": true,
    "orchestration": true
  }
}
```

## Troubleshooting

### "Not Authenticated"
```bash
gh auth login
```

### "API Key not found"
```bash
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY
```

### Tests failing
```bash
npm install
npm test
```

## Performance

- **Code Generation**: ~2-5 seconds per request
- **Workflow Execution**: <1 second per step (without API calls)
- **Team Operations**: <100ms
- **GitHub Operations**: ~1-2 seconds

## Security

- API keys never logged or exposed
- All credentials stored in `.env` (gitignored)
- GitHub tokens have limited scope
- Supports token rotation

## License

MIT

## Support

- GitHub Issues: https://github.com/Maliot100X/-OmniAgent/issues
- Documentation: `/docs` folder
- Examples: `/docs/EXAMPLES.md`

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**OmniAgent** - Empowering AI with unified agent capabilities 🌟
