import { commandRegistry } from './implementations.js';
import { systemCommands } from './advanced-system.js';
import { extendedCommands } from './advanced-system.js';
import { megaCommands } from './mega-commands.js';

export const allCommands = {
  ...commandRegistry,
  ...systemCommands,
  ...extendedCommands,
  ...megaCommands
};

console.log(`OMNIGENT: ${Object.keys(allCommands).length} commands loaded`);
export default allCommands;
