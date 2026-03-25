#!/usr/bin/env node

import OmniAgentFramework from "./src/index.js";
import readline from "readline";

async function main() {
  const framework = new OmniAgentFramework();
  const initialized = await framework.initialize();

  if (!initialized) {
    console.error("❌ Failed to initialize OmniAgent");
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question("OmniAgent> ", async (input) => {
      if (input.trim()) {
        try {
          await framework.handleCommand(input);
        } catch (error) {
          console.error("❌ Error:", error.message);
        }
      }
      prompt();
    });
  };

  prompt();
}

main().catch((error) => {
  console.error("Fatal Error:", error);
  process.exit(1);
});
