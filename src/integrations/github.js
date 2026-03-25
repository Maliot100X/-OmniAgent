import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class GitHubIntegration {
  constructor() {
    this.authenticated = false;
  }

  async checkAuth() {
    try {
      const { stdout } = await execAsync("gh auth status");
      this.authenticated = true;
      return { success: true, message: stdout };
    } catch (error) {
      return { success: false, message: "Not authenticated" };
    }
  }

  async createRepo(repoName, description = "", isPrivate = false) {
    try {
      const visibility = isPrivate ? "--private" : "--public";
      const { stdout } = await execAsync(
        `gh repo create ${repoName} ${visibility} --description "${description}"`
      );
      return { success: true, output: stdout, repo: repoName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cloneRepo(repoUrl, targetDir) {
    try {
      const { stdout } = await execAsync(`git clone ${repoUrl} ${targetDir}`);
      return { success: true, output: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async pushChanges(message = "Update from OmniAgent") {
    try {
      await execAsync("git add .");
      const { stdout: commitOutput } = await execAsync(
        `git commit -m "${message}"`
      );
      const { stdout: pushOutput } = await execAsync("git push");
      return {
        success: true,
        commit: commitOutput,
        push: pushOutput,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRepoInfo(owner, repo) {
    try {
      const { stdout } = await execAsync(`gh repo view ${owner}/${repo}`);
      return { success: true, info: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createIssue(title, body, labels = []) {
    try {
      const labelString = labels.map((l) => `--label "${l}"`).join(" ");
      const { stdout } = await execAsync(
        `gh issue create --title "${title}" --body "${body}" ${labelString}`
      );
      return { success: true, issue: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createPullRequest(title, body, baseBranch = "main") {
    try {
      const { stdout } = await execAsync(
        `gh pr create --title "${title}" --body "${body}" --base ${baseBranch}`
      );
      return { success: true, pr: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllCommits() {
    try {
      const { stdout } = await execAsync("git log --oneline -20");
      return { success: true, commits: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentBranch() {
    try {
      const { stdout } = await execAsync(
        "git rev-parse --abbrev-ref HEAD"
      );
      return { success: true, branch: stdout.trim() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createBranch(branchName) {
    try {
      await execAsync(`git checkout -b ${branchName}`);
      return { success: true, branch: branchName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async switchBranch(branchName) {
    try {
      await execAsync(`git checkout ${branchName}`);
      return { success: true, branch: branchName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async mergeBranch(sourceBranch) {
    try {
      const { stdout } = await execAsync(`git merge ${sourceBranch}`);
      return { success: true, output: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteBranch(branchName) {
    try {
      await execAsync(`git branch -d ${branchName}`);
      return { success: true, branch: branchName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFileContent(filePath) {
    try {
      const { stdout } = await execAsync(`gh api repos/:owner/:repo/contents/${filePath}`);
      return { success: true, content: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listPullRequests(state = "open") {
    try {
      const { stdout } = await execAsync(`gh pr list --state ${state}`);
      return { success: true, prs: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listIssues(state = "open") {
    try {
      const { stdout } = await execAsync(`gh issue list --state ${state}`);
      return { success: true, issues: stdout };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default GitHubIntegration;
