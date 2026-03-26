#!/usr/bin/env node
import SetupWizard from './wizard.js';

const wizard = new SetupWizard();
wizard.start().catch(e => console.error('Setup error:', e));
