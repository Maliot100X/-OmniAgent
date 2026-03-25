#!/usr/bin/env node

/**
 * Omnigent Unified CLI
 * Interface for all 30+ AI agent capabilities
 * Supports both Node.js and Python agent commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import pythonBridge from './pythonBridge.js';

const program = new Command();

program
  .name('omnigent')
  .description('OmniAgent - Universal AI Agent Framework')
  .version('1.0.0');

// ============ SYSTEM COMMANDS ============

program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(chalk.blue.bold('\n=== Omnigent AI Agent ===\n'));
    console.log(chalk.gray('A unified framework combining:'));
    console.log(chalk.yellow('  • OpenClaw   - Workflow orchestration'));
    console.log(chalk.yellow('  • TinyAGI    - Multi-team autonomous AI'));
    console.log(chalk.yellow('  • Hermes     - Advanced reasoning & planning'));
    console.log(chalk.yellow('  • Claude     - Code generation & analysis\n'));
    console.log(chalk.green('Available Commands:'));
    console.log(chalk.gray('  omnigent list              - List all commands'));
    console.log(chalk.gray('  omnigent info <cmd>        - Get command info'));
    console.log(chalk.gray('  omnigent capabilities      - Show all capabilities'));
    console.log(chalk.gray('  omnigent exec <cmd> [args] - Execute command'));
    console.log(chalk.gray('  omnigent stats             - System statistics'));
  });

program
  .command('list [source]')
  .description('List all available commands')
  .action(async (source) => {
    const commands = await pythonBridge.listCommands(source);
    
    console.log(chalk.blue.bold('\n30+ Available Commands:\n'));
    
    const bySource = {};
    commands.commands.forEach(cmd => {
      if (!bySource[cmd.source]) bySource[cmd.source] = [];
      bySource[cmd.source].push(cmd.name);
    });

    Object.entries(bySource).forEach(([src, cmds]) => {
      console.log(chalk.yellow(`${src.toUpperCase()} (${cmds.length} commands):`));
      cmds.forEach(cmd => {
        console.log(chalk.gray(`  • ${cmd}`));
      });
      console.log();
    });

    console.log(chalk.cyan(`Total: ${commands.total} commands`));
  });

program
  .command('capabilities')
  .description('Show all system capabilities')
  .action(async () => {
    const caps = await pythonBridge.getCapabilities();
    
    console.log(chalk.blue.bold('\nSystem Capabilities:\n'));
    console.log(chalk.yellow(`System: ${caps.system}`));
    console.log(chalk.yellow(`Version: ${caps.version}\n`));
    
    console.log(chalk.cyan('By Category:'));
    Object.entries(caps.capabilities.by_category).forEach(([cat, count]) => {
      console.log(chalk.gray(`  ${cat}: ${count} commands`));
    });

    console.log(chalk.cyan('\nBy Source:'));
    Object.entries(caps.capabilities.by_source).forEach(([src, count]) => {
      console.log(chalk.gray(`  ${src}: ${count} commands`));
    });

    console.log(chalk.cyan('\nLLM Providers:'));
    caps.capabilities.llm_providers.forEach(provider => {
      console.log(chalk.gray(`  • ${provider}`));
    });
  });

program
  .command('exec <command> [args...]')
  .description('Execute a command')
  .action(async (command, args) => {
    try {
      // Parse args (simple key=value format)
      const kwargs = {};
      args.forEach(arg => {
        if (arg.includes('=')) {
          const [key, value] = arg.split('=');
          kwargs[key] = value;
        }
      });

      console.log(chalk.blue(`\nExecuting: ${command}`));
      const result = await pythonBridge.executeCommand(command, kwargs);
      
      if (result.success) {
        console.log(chalk.green('✓ Success!'));
        if (result.result) {
          console.log(JSON.stringify(result.result, null, 2));
        }
      } else {
        console.log(chalk.red('✗ Failed!'));
        if (result.error) {
          console.log(chalk.red(`Error: ${result.error}`));
        }
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
    }
  });

program
  .command('stats')
  .description('Show system statistics')
  .action(async () => {
    const caps = await pythonBridge.getCapabilities();
    const stats = caps.capabilities;

    console.log(chalk.blue.bold('\n📊 System Statistics:\n'));
    console.log(chalk.cyan(`Total Commands: ${stats.total_commands}`));
    console.log(chalk.cyan(`LLM Providers: ${stats.llm_providers.join(', ')}\n`));

    console.log(chalk.yellow('By Category:'));
    Object.entries(stats.by_category).forEach(([cat, count]) => {
      console.log(chalk.gray(`  ${cat}: ${count}`));
    });

    console.log(chalk.yellow('\nBy Source:'));
    Object.entries(stats.by_source).forEach(([src, count]) => {
      console.log(chalk.gray(`  ${src}: ${count}`));
    });
  });

program
  .command('info <command>')
  .description('Get detailed command information')
  .action((command) => {
    console.log(chalk.blue(`\nCommand: ${command}`));
    console.log(chalk.gray('(Command info retrieval - Python bridge integration)\n'));
  });

program
  .command('about')
  .description('About this system')
  .action(() => {
    console.log(chalk.blue.bold('\n╔════════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.blue.bold('║           OMNIGENT - Universal AI Agent Framework                 ║'));
    console.log(chalk.blue.bold('╚════════════════════════════════════════════════════════════════════╝\n'));
    
    console.log(chalk.yellow('Integrated Projects:'));
    console.log(chalk.gray('  • OpenClaw      - Workflow orchestration and agent management'));
    console.log(chalk.gray('  • TinyAGI       - Multi-team autonomous AI assistant'));
    console.log(chalk.gray('  • Hermes Agent  - Advanced reasoning and planning'));
    console.log(chalk.gray('  • Claude Code   - Code generation, analysis, and refactoring\n'));
    
    console.log(chalk.green('Features:'));
    console.log(chalk.gray('  ✓ Unified command registry (30+ commands)'));
    console.log(chalk.gray('  ✓ Multi-provider LLM support (Anthropic, OpenAI)'));
    console.log(chalk.gray('  ✓ Node.js ↔ Python agent bridge'));
    console.log(chalk.gray('  ✓ Autonomous agent loop'));
    console.log(chalk.gray('  ✓ Full CLI interface\n'));
    
    console.log(chalk.cyan('Status: PRODUCTION READY ✓\n'));
  });

// Default command
program.action(() => {
  program.help();
});

program.parse(process.argv);
