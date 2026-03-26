import express from 'express';
import cors from 'cors';
import allCommands from '../commands/index.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/commands', (req, res) => res.json({ commands: Object.keys(allCommands), total: Object.keys(allCommands).length }));
app.post('/api/commands/:name', (req, res) => {
  const cmd = allCommands[req.params.name];
  if (!cmd) return res.status(404).json({ error: 'Not found' });
  try { res.json({ success: true, result: cmd(...(req.body.args || [])) }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/platforms', (req, res) => res.json({ platforms: ['discord', 'telegram', 'slack', 'teams', 'signal', 'whatsapp', 'viber', 'skype', 'line', 'twitch', 'linkedin'] }));
app.get('/api/analytics', (req, res) => res.json({ totalCommands: 0, sessions: 0 }));
app.get('/api/skills', (req, res) => res.json({ skills: [] }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on ${PORT}`));
