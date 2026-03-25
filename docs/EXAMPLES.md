# OmniAgent - Examples & Use Cases

## Example 1: Data Pipeline with Teams

```javascript
import OmniAgent from './src/agent/omnigent.js';

async function dataProcessingPipeline() {
  const agent = new OmniAgent();
  await agent.initialize();

  // Create analysis team
  const team = agent.createTeam("DataAnalysis", []);

  // Add team members
  agent.registerCollaborator("DataFetcher", ["fetching", "validation"]);
  agent.registerCollaborator("DataProcessor", ["processing", "transformation"]);
  agent.registerCollaborator("ReportGenerator", ["reporting", "visualization"]);

  // Add tasks
  agent.addTask("FetchData", "Fetch Q1 sales data from API", "high");
  agent.addTask("ProcessData", "Transform and clean data", "high");
  agent.addTask("GenerateReport", "Create quarterly report", "normal");

  // Execute all tasks
  const results = await agent.executeTasks();
  console.log("Pipeline results:", results);

  // Broadcast completion
  agent.broadcastMessage("Data pipeline completed successfully");

  // Get team stats
  console.log(agent.tinyagi.getStats());
}

dataProcessingPipeline().catch(console.error);
```

## Example 2: Multi-Agent Orchestration with Hermes

```javascript
import OmniAgent from './src/agent/omnigent.js';

async function multiAgentOrchestration() {
  const agent = new OmniAgent();
  await agent.initialize();

  // Register multiple specialized agents
  agent.registerAgent("APIAgent", { 
    role: "backend", 
    capabilities: ["api-development", "rest"] 
  });

  agent.registerAgent("DatabaseAgent", { 
    role: "database", 
    capabilities: ["sql", "optimization"] 
  });

  agent.registerAgent("SecurityAgent", { 
    role: "security", 
    capabilities: ["auth", "validation"] 
  });

  // Register communication protocol
  agent.registerProtocol("secure-communication", {
    encrypt: (data) => ({ encrypted: true }),
    decrypt: (data) => ({ decrypted: true })
  });

  // Discover backend agents
  const backendAgents = agent.discoverAgents({ role: "backend" });
  console.log("Backend agents found:", backendAgents.length);

  // Coordinate workflow
  const plan = {
    name: "Build API",
    steps: [
      { agent: "DatabaseAgent", instruction: "Design schema" },
      { agent: "APIAgent", instruction: "Build endpoints" },
      { agent: "SecurityAgent", instruction: "Add authentication" }
    ]
  };

  // Execute coordination
  const results = await agent.hermes.executeCoordination(plan);
  console.log("Coordination results:", results);
}

multiAgentOrchestration().catch(console.error);
```

## Example 3: Workflow Orchestration with OpenClaw

```javascript
import OmniAgent from './src/agent/omnigent.js';

async function complexWorkflow() {
  const agent = new OmniAgent();
  await agent.initialize();

  // Register data processing executors
  agent.registerExecutor("validate", async (data) => {
    console.log("Validating data...");
    return { valid: true, records: data.records };
  });

  agent.registerExecutor("transform", async (data) => {
    console.log("Transforming data...");
    return { transformed: true, count: data.records };
  });

  agent.registerExecutor("export", async (data) => {
    console.log("Exporting to CSV...");
    return { exported: true, file: "data.csv" };
  });

  // Create workflow
  const workflow = agent.createWorkflow("DataExportPipeline", []);

  // Define steps
  agent.addStep(workflow.id, "Validation", "validate", { records: 1000 });
  agent.addStep(workflow.id, "Transformation", "transform", { format: "csv" });
  agent.addStep(workflow.id, "Export", "export", { destination: "s3" });

  // Execute with retry logic
  try {
    const results = await agent.executeWorkflow(workflow.id, 3);
    console.log("Workflow completed:", results);
  } catch (error) {
    console.error("Workflow failed:", error.message);
  }

  // Check workflow status
  const status = agent.openclaw.getWorkflowStatus(workflow.id);
  console.log("Final status:", status);
}

complexWorkflow().catch(console.error);
```

## Example 4: Code Generation & Analysis

```javascript
import OmniAgent from './src/agent/omnigent.js';

async function codeGenerationWorkflow() {
  const agent = new OmniAgent();
  await agent.initialize();

  // Generate code
  console.log("🔧 Generating authentication module...");
  const authCode = await agent.generateCode(
    "Create JWT authentication middleware for Express.js with role-based access control",
    "javascript"
  );

  console.log("Generated code:");
  console.log(authCode.code);

  // Analyze the generated code
  console.log("\n🔍 Analyzing generated code...");
  const analysis = await agent.analyzeCode(authCode.code, "javascript");
  console.log("Analysis:\n", analysis.analysis);

  // Generate documentation
  console.log("\n📚 Generating documentation...");
  const docs = await agent.generateDocumentation(authCode.code);
  console.log("Documentation:\n", docs.documentation);

  // Generate tests
  console.log("\n🧪 Generating tests...");
  const tests = await agent.generateTests(authCode.code);
  console.log("Tests:\n", tests.testCode);

  // Store in library
  agent.storeCode("jwt-auth", authCode.code, {
    version: "1.0",
    framework: "express",
    tags: ["authentication", "jwt", "security"]
  });

  console.log("✅ Code stored in library");

  // Retrieve from library
  const stored = agent.claudeCode.retrieveFromLibrary("jwt-auth");
  console.log("Retrieved from library:", !!stored);
}

codeGenerationWorkflow().catch(console.error);
```

## Example 5: GitHub Automation

```javascript
import GitHubIntegration from './src/integrations/github.js';

async function githubAutomation() {
  const github = new GitHubIntegration();

  // Check authentication
  const auth = await github.checkAuth();
  console.log("Authenticated:", auth.success);

  // Create new repository
  const repo = await github.createRepo(
    "ai-data-processor",
    "AI-powered data processing tool",
    false
  );
  console.log("Repository created:", repo.repo);

  // Create feature branch
  const branch = await github.createBranch("feature/core-processor");
  console.log("Branch created:", branch.branch);

  // Create issue
  const issue = await github.createIssue(
    "Add data validation",
    "Implement comprehensive data validation for input datasets",
    ["enhancement", "data-processing"]
  );
  console.log("Issue created");

  // Create pull request
  const pr = await github.createPullRequest(
    "Implement core processor",
    "Adds the main data processing engine with validation",
    "main"
  );
  console.log("PR created");

  // Push changes
  const push = await github.pushChanges("Add core processor module");
  console.log("Changes pushed:", push.success);

  // List pull requests
  const prs = await github.listPullRequests("open");
  console.log("Open PRs:\n", prs.prs);

  // Get repo info
  const info = await github.getRepoInfo("owner", "repo");
  console.log("Repo info:", info.info);
}

githubAutomation().catch(console.error);
```

## Example 6: Complete Data Science Pipeline

```javascript
import OmniAgent from './src/agent/omnigent.js';

async function completeDataSciencePipeline() {
  const agent = new OmniAgent();
  await agent.initialize();

  console.log("🚀 Starting Data Science Pipeline\n");

  // Step 1: Create team
  const team = agent.createTeam("DataScienceTeam", []);
  agent.registerCollaborator("DataEngineer", ["fetching", "cleaning"]);
  agent.registerCollaborator("Analyst", ["analysis", "modeling"]);
  agent.registerCollaborator("Scientist", ["ml", "predictions"]);

  console.log("✓ Team created\n");

  // Step 2: Generate analysis code
  console.log("🔧 Generating analysis code...");
  const analysisCode = await agent.generateCode(
    "Create Python script for exploratory data analysis with pandas and matplotlib",
    "python"
  );
  agent.storeCode("eda-script", analysisCode.code);
  console.log("✓ Analysis code generated and stored\n");

  // Step 3: Generate ML model code
  console.log("🔧 Generating ML model code...");
  const mlCode = await agent.generateCode(
    "Build scikit-learn classifier for customer churn prediction",
    "python"
  );
  agent.storeCode("churn-model", mlCode.code);
  console.log("✓ ML code generated and stored\n");

  // Step 4: Create workflow
  const workflow = agent.createWorkflow("DataSciencePipeline", []);

  agent.registerExecutor("load-data", async () => ({
    rows: 10000,
    columns: 25
  }));

  agent.registerExecutor("analyze", async () => ({
    correlations: "computed",
    outliers: "detected"
  }));

  agent.registerExecutor("train-model", async () => ({
    accuracy: 0.92,
    f1_score: 0.89
  }));

  agent.addStep(workflow.id, "Load", "load-data");
  agent.addStep(workflow.id, "Analyze", "analyze");
  agent.addStep(workflow.id, "Train", "train-model");

  console.log("⚙️  Executing pipeline...");
  const results = await agent.executeWorkflow(workflow.id);
  console.log("✓ Pipeline completed\n");

  // Step 5: Get stats
  const stats = agent.getFullStats();
  console.log("📊 Pipeline Statistics:");
  console.log(`   Generated Code: ${stats.claudeCode.generatedCodeCount}`);
  console.log(`   Library Size: ${stats.claudeCode.librarySize}`);
  console.log(`   Workflows: ${stats.openclaw.workflows}`);
  console.log(`   Team Members: ${stats.tinyagi.collaborators}`);
}

completeDataSciencePipeline().catch(console.error);
```

## Example 7: Real-Time CLI Usage

```bash
# 1. Generate a web scraper
OmniAgent> code generate "Create a Node.js web scraper with Cheerio for extracting product data"

# 2. Create a team for data processing
OmniAgent> team create WebScraping
OmniAgent> team add WebFetcher fetching parsing
OmniAgent> team add DataCleaner cleaning validation

# 3. Create a workflow
OmniAgent> workflow create ScrapeAndProcess

# 4. Register agents
OmniAgent> agent register ScraperAgent scraper
OmniAgent> agent register ProcessorAgent processor

# 5. Add tasks
OmniAgent> task add ScrapeWebsites "Fetch data from e-commerce sites"
OmniAgent> task add ProcessData "Clean and validate scraped data"
OmniAgent> task add ExportData "Export to CSV and database"

# 6. Execute all tasks
OmniAgent> task execute

# 7. View statistics
OmniAgent> stats

# 8. Push to GitHub
OmniAgent> push "Add web scraper implementation"
```

## Performance Tips

1. **Reuse agent instances** - Don't recreate agents repeatedly
2. **Batch operations** - Queue workflows instead of executing one by one
3. **Use task priorities** - High priority tasks execute first
4. **Cache code** - Store frequently used code in library
5. **Monitor stats** - Use `getFullStats()` to track resource usage

## Error Handling

```javascript
try {
  const workflow = agent.createWorkflow("Important", []);
  const results = await agent.executeWorkflow(workflow.id, 5);
} catch (error) {
  console.error("Workflow failed:", error.message);
  // Fallback logic
}
```

---

**For more information**, see the [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
