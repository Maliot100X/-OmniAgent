/**
 * Python Bridge - Node.js ↔ Python Agent Communication
 * Allows Node.js CLI to invoke Python agent functions
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PythonBridge {
  constructor() {
    this.pythonProcess = null;
    this.pythonReady = false;
    this.commandBuffer = [];
  }

  /**
   * Start the Python bridge server
   */
  async start() {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '..', 'python_agents', 'bridge.py');
      
      if (!fs.existsSync(pythonScript)) {
        reject(new Error(`Python bridge script not found: ${pythonScript}`));
        return;
      }

      this.pythonProcess = spawn('python', [pythonScript], {
        cwd: path.join(__dirname, '..', 'python_agents'),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';

      this.pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        
        // Check if bridge is ready
        if (output.includes('"status": "ready"')) {
          this.pythonReady = true;
          resolve(JSON.parse(output.trim()));
        }
      });

      this.pythonProcess.stderr.on('data', (data) => {
        console.error(`[PythonBridge] ${data.toString()}`);
      });

      this.pythonProcess.on('error', (err) => {
        reject(err);
      });

      this.pythonProcess.on('exit', (code) => {
        this.pythonReady = false;
        console.log(`[PythonBridge] Process exited with code ${code}`);
      });

      // Timeout if bridge doesn't start
      setTimeout(() => {
        if (!this.pythonReady) {
          reject(new Error('Python bridge startup timeout'));
        }
      }, 5000);
    });
  }

  /**
   * Execute a Python command
   */
  async executeCommand(commandName, args = {}) {
    if (!this.pythonReady) {
      return {
        success: false,
        error: 'Python bridge not ready',
      };
    }

    return new Promise((resolve, reject) => {
      try {
        const command = {
          method: 'execute_command',
          command_name: commandName,
          args: args,
        };

        // Send command to Python process
        this.pythonProcess.stdin.write(JSON.stringify(command) + '\n', (err) => {
          if (err) {
            reject(err);
          }
        });

        // Wait for response (simplified - in production use proper IPC)
        setTimeout(() => {
          resolve({
            success: true,
            command: commandName,
            note: 'Check Python process output',
          });
        }, 100);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * List all available commands
   */
  async listCommands(source = null) {
    // For now, return hardcoded list
    // In production, query Python bridge
    return {
      success: true,
      commands: [
        // OpenClaw
        { name: 'execute_workflow', source: 'openclaw', category: 'automation' },
        { name: 'list_agents', source: 'openclaw', category: 'system' },
        { name: 'create_agent', source: 'openclaw', category: 'system' },
        // TinyAGI
        { name: 'create_team', source: 'tinyagi', category: 'automation' },
        { name: 'add_task', source: 'tinyagi', category: 'automation' },
        { name: 'execute_tasks', source: 'tinyagi', category: 'automation' },
        { name: 'get_team_status', source: 'tinyagi', category: 'system' },
        // Hermes
        { name: 'reason_about_task', source: 'hermes', category: 'analysis' },
        { name: 'plan_execution', source: 'hermes', category: 'analysis' },
        { name: 'get_reasoning_context', source: 'hermes', category: 'analysis' },
        // Claude Code
        { name: 'generate_code', source: 'claude_code', category: 'code' },
        { name: 'analyze_code', source: 'claude_code', category: 'code' },
        { name: 'debug_code', source: 'claude_code', category: 'code' },
        { name: 'generate_tests', source: 'claude_code', category: 'code' },
        { name: 'refactor_code', source: 'claude_code', category: 'code' },
        // Custom
        { name: 'system_command', source: 'custom', category: 'system' },
        { name: 'file_read', source: 'custom', category: 'system' },
        { name: 'file_write', source: 'custom', category: 'system' },
        { name: 'json_parse', source: 'custom', category: 'system' },
      ],
      total: 19,
      by_source: {
        openclaw: 3,
        tinyagi: 4,
        hermes: 3,
        claude_code: 5,
        custom: 4,
      },
    };
  }

  /**
   * Get system capabilities
   */
  async getCapabilities() {
    return {
      success: true,
      system: 'Omnigent Python Agent',
      version: '1.0.0',
      capabilities: {
        total_commands: 19,
        by_category: {
          automation: 4,
          analysis: 3,
          code: 5,
          system: 7,
        },
        by_source: {
          openclaw: 3,
          tinyagi: 4,
          hermes: 3,
          claude_code: 5,
          custom: 4,
        },
        llm_providers: ['anthropic', 'openai'],
      },
    };
  }

  /**
   * Stop the Python bridge
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.pythonProcess) {
        this.pythonProcess.kill();
        this.pythonReady = false;
      }
      resolve();
    });
  }
}

export default new PythonBridge();
