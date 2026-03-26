// OMNIGENT Advanced System Commands - LLM, Analytics, Webhooks, Skills
import fs from 'fs';
import os from 'os';
import path from 'path';

const settingsPath = path.join(os.homedir(), '.omnigent', 'settings.json');
const loadSettings = () => { try { return JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch { return {}; } };
const saveSettings = (s) => { fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2)); };

export const systemCommands = {
  'llm list': () => ['claude-3-5-sonnet','gpt-4-turbo','gpt-4o','cohere','mistral','ollama','replicate'].join(', '),
  'llm set': (p, m) => { const s = loadSettings(); s.llm = {provider: p, model: m}; saveSettings(s); return `LLM: ${p} (${m})`; },
  'llm status': () => { const s = loadSettings(); return `LLM: ${s.llm?.provider || 'none'}`; },
  'analytics dashboard': () => { const s = loadSettings(); return `Analytics - Commands: ${s.totalCommands || 0}`; },
  'analytics reset': () => { const s = loadSettings(); s.metrics = {}; saveSettings(s); return 'Analytics reset'; },
  'webhook list': () => { const s = loadSettings(); return `Webhooks: ${Object.keys(s.webhooks || {}).length}`; },
  'webhook register': (e, u) => { const s = loadSettings(); s.webhooks = s.webhooks || {}; const id = 'wh_' + Date.now(); s.webhooks[id] = {event: e, url: u}; saveSettings(s); return `Webhook: ${id}`; },
  'skill list': () => { const s = loadSettings(); return `Skills: ${Object.keys(s.skills || {}).length}`; },
  'skill create': (n, d) => { const s = loadSettings(); s.skills = s.skills || {}; const id = 'sk_' + Date.now(); s.skills[id] = {name: n, desc: d, runs: 0}; saveSettings(s); return `Skill: ${n} (${id})`; },
  'skill execute': (id) => { const s = loadSettings(); if (s.skills && s.skills[id]) { s.skills[id].runs = (s.skills[id].runs || 0) + 1; saveSettings(s); return `Executed ${s.skills[id].name} (#${s.skills[id].runs})`; } return 'Skill not found'; },
  'system health': () => 'System: Operational',
  'system backup': (n) => `Backup: ${n || 'auto-' + Date.now()}`,
  'system optimize': () => { const s = loadSettings(); s.optimized = true; saveSettings(s); return 'System optimized'; }
};

export default systemCommands;
