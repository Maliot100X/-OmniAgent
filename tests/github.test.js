import { test } from "node:test";
import assert from "node:assert";
import GitHubIntegration from "../src/integrations/github.js";

test("GitHub - Initialization", async (t) => {
  const github = new GitHubIntegration();
  assert.strictEqual(github.authenticated, false);
});

test("GitHub - Methods exist", async (t) => {
  const github = new GitHubIntegration();

  assert.strictEqual(typeof github.checkAuth, "function");
  assert.strictEqual(typeof github.createRepo, "function");
  assert.strictEqual(typeof github.cloneRepo, "function");
  assert.strictEqual(typeof github.pushChanges, "function");
  assert.strictEqual(typeof github.getRepoInfo, "function");
  assert.strictEqual(typeof github.createBranch, "function");
  assert.strictEqual(typeof github.getCurrentBranch, "function");
});

test("GitHub - Error handling", async (t) => {
  const github = new GitHubIntegration();
  const result = await github.getRepoInfo("nonexistent", "repo");

  assert.strictEqual(result.success, false);
  assert.ok(result.error);
});

export default { test };
