import { commandRegistry } from './implementations.js';
import { systemCommands, extendedCommands } from './advanced-system.js';
import { configureCommands } from './advanced-system.js';
import { agentIntegrationCommands } from './advanced-system.js';
import { megaCommands } from './mega-commands.js';

export const allCommands = {
  ...commandRegistry,
  ...systemCommands,
  ...extendedCommands,
  ...configureCommands,
  ...agentIntegrationCommands,
  ...megaCommands
};

const total = Object.keys(allCommands).length;
console.log(`✅ OMNIGENT: ${total} commands loaded`);

export default allCommands;
