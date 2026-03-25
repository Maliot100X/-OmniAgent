import readline from "readline";
import OmniAgentFramework from "./index.js";

const framework = new OmniAgentFramework();

async function main() {
  const initialized = await framework.initialize();

  if (!initialized) {
    console.error("Failed to initialize OmniAgent");
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  const prompt = () => {
    rl.question("OmniAgent> ", async (input) => {
      if (input.trim()) {
        await framework.handleCommand(input);
      }
      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
