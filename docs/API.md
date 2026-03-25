# OmniAgent - API Reference

## Core Classes

### OmniAgent

Main AI agent class for querying and managing conversations.

```javascript
import OmniAgent from './src/agent/omnigent.js';

const agent = new OmniAgent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20241022'
});
```

#### Methods

**`initialize()`**
- Initializes the agent
- Returns: `Promise<boolean>`

```javascript
await agent.initialize();
```

**`query(userMessage, systemPrompt?)`**
- Query the agent
- Returns: `Promise<{response: string, usage: {input: number, output: number}}>`

```javascript
const result = await agent.query("What is a React hook?");
console.log(result.response);
```

**`executePlan(plan)`**
- Execute a multi-step plan
- Returns: `Promise<void>`

```javascript
await agent.executePlan({
  name: "Setup Project",
  steps: [
    { description: "Create files", instruction: "Create necessary project files" },
    { description: "Install deps", instruction: "Install dependencies" }
  ]
});
```

**`clearHistory()`**
- Clear conversation history
- Returns: `void`

```javascript
agent.clearHistory();
```

**`getCapabilities()`**
- Get agent capabilities
- Returns: `object`

```javascript
const caps = agent.getCapabilities();
```

---

### GitHubIntegration

GitHub integration for repository and workflow management.

```javascript
import GitHubIntegration from './src/integrations/github.js';

const github = new GitHubIntegration();
```

#### Methods

**`checkAuth()`**
- Check GitHub authentication status
- Returns: `Promise<{success: boolean, message: string}>`

**`createRepo(repoName, description?, isPrivate?)`**
- Create a new repository
- Returns: `Promise<{success: boolean, repo?: string, error?: string}>`

```javascript
await github.createRepo("my-project", "My awesome project", false);
```

**`cloneRepo(repoUrl, targetDir)`**
- Clone a repository
- Returns: `Promise<{success: boolean, output?: string, error?: string}>`

```javascript
await github.cloneRepo("https://github.com/user/repo", "./repos/project");
```

**`pushChanges(message?)`**
- Push changes to remote
- Returns: `Promise<{success: boolean, commit?: string, push?: string, error?: string}>`

```javascript
await github.pushChanges("Add new features");
```

**`createBranch(branchName)`**
- Create and switch to new branch
- Returns: `Promise<{success: boolean, branch: string, error?: string}>`

```javascript
await github.createBranch("feature/new-feature");
```

**`switchBranch(branchName)`**
- Switch to existing branch
- Returns: `Promise<{success: boolean, branch: string, error?: string}>`

```javascript
await github.switchBranch("main");
```

**`mergeBranch(sourceBranch)`**
- Merge source branch into current branch
- Returns: `Promise<{success: boolean, output?: string, error?: string}>`

```javascript
await github.mergeBranch("feature/new-feature");
```

**`createIssue(title, body, labels?)`**
- Create GitHub issue
- Returns: `Promise<{success: boolean, issue?: string, error?: string}>`

```javascript
await github.createIssue("Bug: Login fails", "Login page crashes on mobile", ["bug", "urgent"]);
```

**`createPullRequest(title, body, baseBranch?)`**
- Create pull request
- Returns: `Promise<{success: boolean, pr?: string, error?: string}>`

```javascript
await github.createPullRequest("Add dark mode", "Implements dark mode toggle", "main");
```

**`listPullRequests(state?)`**
- List pull requests
- Returns: `Promise<{success: boolean, prs?: string, error?: string}>`

```javascript
const prs = await github.listPullRequests("open");
```

**`listIssues(state?)`**
- List issues
- Returns: `Promise<{success: boolean, issues?: string, error?: string}>`

```javascript
const issues = await github.listIssues("open");
```

---

## Configuration

Configure OmniAgent via `.env` or `config/config.json`:

```json
{
  "apiKey": "sk-ant-...",
  "model": "claude-3-5-sonnet-20241022",
  "features": {
    "github": true,
    "codeGeneration": true,
    "debugging": true
  }
}
```

---

## Examples

See `/docs/EXAMPLES.md` for comprehensive examples.
