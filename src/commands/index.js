// Master Command Registry - All 200+ commands
import { commandRegistry } from './implementations.js';
import { systemCommands } from './advanced-system.js';

export const allCommands = {
  ...commandRegistry,
  ...systemCommands
};

export default allCommands;
