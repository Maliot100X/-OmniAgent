# 🚀 OMNIGENT Quick Start Guide

## Installation

### Option 1: Direct Installation
```bash
git clone https://github.com/Maliot100X/-OmniAgent omnigent
cd omnigent
npm install
npm start
```

### Option 2: Docker
```bash
git clone https://github.com/Maliot100X/-OmniAgent omnigent
cd omnigent
npm run docker-build
npm run docker-run
```

## First Run

### 1. Start CLI
```bash
npm start
```

### 2. Try Some Commands
```
help              # Show all commands
list-commands     # List 350+ commands
status            # Check system status
llm list          # Show available LLM providers
platform list     # Show 19 messaging platforms
```

### 3. Configure LLM
```
llm set claude-3-5-sonnet gpt-4
llm set-key anthropic sk_YOUR_KEY_HERE
llm status
```

### 4. Connect a Platform
```
platform connect discord YOUR_DISCORD_TOKEN
platform connect telegram YOUR_TELEGRAM_BOT_TOKEN
platform status
```

### 5. Create Your First Agent
```
agent create my-agent general
agent configure my-agent provider claude
agent list
agent run my-agent "Say hello"
```

### 6. Create a Workflow
```
workflow create my-workflow
workflow execute my-workflow
```

### 7. Setup a Webhook
```
webhook register command-executed http://localhost:3000/webhook
webhook list
webhook test webhook_123
```

### 8. Create a Skill
```
skill create data-processor "Process and transform data"
skill list
skill execute skill_123
```

### 9. Check Analytics
```
analytics dashboard
analytics commands
analytics performance
```

### 10. Monitor System
```
system health
system optimize
system backup my-backup
```

## Available Platforms

Can connect to ANY of these 19 platforms:

1. Discord - Gaming & communities
2. Telegram - Fast messaging
3. WhatsApp - Mobile messaging (Twilio)
4. Slack - Business chat
5. Microsoft Teams - Enterprise
6. Signal - Secure messaging
7. Google Chat - Google Workspace
8. Matrix - Decentralized chat
9. IRC - Classic chat protocol
10. Email - Traditional communication
11. WebSocket - Custom connections
12. Zalo - Asian messaging
13. Viber - Mobile messaging
14. Skype - Video & messaging
15. LINE - Asian social platform
16. Twitch - Live streaming chat
17. LinkedIn - Professional network
18. WebChat - In-browser chat
19. Custom API - Your own integrations

## Available LLM Providers

Can switch between 25+ providers:

- Claude (Anthropic) - 3.5 Sonnet, 3 Opus, 3 Haiku
- GPT-4 (OpenAI) - GPT-4 Turbo, GPT-4o
- GPT-3.5 (OpenAI)
- Cohere - Command-R+ (most powerful)
- Mistral AI - Mistral Large
- Google Gemini - Advanced reasoning
- Meta Llama - Open source
- HuggingFace - 1000+ models
- Ollama - Local LLMs
- Replicate - API-based
- AI21 Labs
- Together AI
- And more...

## REST API

Start API server:
```bash
npm run api
```

API runs on http://localhost:3000

### Key Endpoints

```bash
# Get all commands
curl http://localhost:3000/api/commands

# Execute a command
curl -X POST http://localhost:3000/api/commands/llm-list

# Get platforms
curl http://localhost:3000/api/platforms

# Get analytics
curl http://localhost:3000/api/analytics

# Get health
curl http://localhost:3000/health
```

## Web Dashboard

Open after starting API:
```
http://localhost:3000/dashboard
```

Features:
- Real-time metrics
- Platform status
- Command counter
- System health
- Quick actions
- All 19 platforms shown

## Directory Structure

```
~/.omnigent/                 # Home directory
├── settings.json           # Your configuration
├── omnigent.db            # SQLite database
├── skills/                # Custom skills
└── backups/               # Backups
```

## Common Commands

```bash
# Agent Management
agent create [name] [type]
agent list
agent run [name] [task]
agent delete [name]

# Platform Management
platform connect [name] [token]
platform list
platform status
platform disconnect [name]

# LLM Management
llm list
llm set [provider] [model]
llm switch [provider]
llm test [prompt]

# Workflow Management
workflow create [name]
workflow execute [name]
workflow list
workflow delete [name]

# Skill Management
skill create [name] [description]
skill list
skill execute [id]
skill delete [id]

# Analytics
analytics dashboard
analytics reset
analytics export [format]

# System
system health
system backup [name]
system restore [name]
system optimize
```

## Configuration

Edit `~/.omnigent/settings.json` to configure:

```json
{
  "llm": {
    "provider": "claude-3-5-sonnet",
    "model": "gpt-4"
  },
  "platforms": {
    "discord": { "token": "YOUR_TOKEN" },
    "telegram": { "token": "YOUR_TOKEN" }
  },
  "webhooks": {},
  "skills": {},
  "automations": {}
}
```

## Troubleshooting

### CLI not starting?
```bash
npm install
npm start
```

### API not working?
```bash
npm run api
# Check http://localhost:3000/health
```

### Database issues?
```bash
rm ~/.omnigent/omnigent.db
npm start
```

### Clear all data?
```bash
rm -rf ~/.omnigent
npm start
```

## Next Steps

1. Configure your favorite platforms
2. Set up LLM providers
3. Create agents
4. Build workflows
5. Create skills
6. Set up webhooks
7. Monitor with analytics
8. Deploy with Docker

## Support

- GitHub Issues: https://github.com/Maliot100X/-OmniAgent/issues
- Documentation: See FEATURES.md

## License
MIT
