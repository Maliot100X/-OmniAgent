import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config();

export function loadConfig() {
  const configPath = resolve("./config/config.json");

  if (!existsSync(configPath)) {
    console.warn("⚠️  Config file not found. Using environment variables.");
    return {
      apiKey: process.env.ANTHROPIC_API_KEY || "",
      model: process.env.MODEL || "claude-3-5-sonnet-20241022",
      githubToken: process.env.GITHUB_TOKEN || "",
    };
  }

  try {
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    return {
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      model: config.model || "claude-3-5-sonnet-20241022",
      githubToken: config.githubToken || process.env.GITHUB_TOKEN,
    };
  } catch (error) {
    console.error("Error loading config:", error.message);
    process.exit(1);
  }
}

export function validateConfig(config) {
  if (!config.apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY not found. Set it in .env or config.json"
    );
  }
  return true;
}
