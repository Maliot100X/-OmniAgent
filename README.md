# OmniAgent - Universal AI Agent Framework

**OmniAgent** is a unified AI agent framework combining the best capabilities from OpenClaw, TinyAGI, Hermes Agent, and Claude Code integration.

## 🚀 Features

- **Multi-Provider AI Support** - Claude, OpenAI, and more
- **GitHub Integration** - Full CLI command support
- **Code Generation** - Intelligent code creation and analysis
- **Agent Orchestration** - Run complex multi-agent workflows
- **Debugging Tools** - Built-in debugging and troubleshooting
- **Interactive CLI** - User-friendly command interface

## 📋 Installation

### Prerequisites
- Node.js 18+
- Git
- GitHub CLI (`gh`)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Maliot100X/-OmniAgent.git
cd omnigent
```

2. Install dependencies:
```bash
npm install
```

3. Configure your API keys:
```bash
cp .env.example .env
```

Edit `.env` and add:
- `ANTHROPIC_API_KEY` - Your Claude API key
- `GITHUB_TOKEN` - Your GitHub personal access token

4. Run OmniAgent:
```bash
npm start
```

## 🎯 Quick Start

### Interactive Mode
```bash
npm start
```

Then use commands like:
```
OmniAgent> ask What is a React hook?
OmniAgent> repo create my-project
OmniAgent> push "Initial commit"
OmniAgent> status
```

### Programmatic Usage
```javascript
import OmniAgent from './src/agent/omnigent.js';

const agent = new OmniAgent({
  apiKey: process.env.ANTHROPIC_API_KEY
});

await agent.initialize();
const result = await agent.query("Help me debug this code");
console.log(result.response);
```

## 📚 Commands

| Command | Description | Example |
|---------|-------------|---------|
| `ask <question>` | Query the AI agent | `ask How do I implement authentication?` |
| `repo create <name>` | Create GitHub repo | `repo create my-project` |
| `repo clone <url>` | Clone repository | `repo clone https://github.com/user/repo` |
| `push [message]` | Push changes | `push "Add new features"` |
| `status` | Show current status | `status` |
| `gh <command>` | Execute raw GitHub CLI | `gh pr list --state open` |
| `help` | Show all commands | `help` |
| `exit` | Exit OmniAgent | `exit` |

## 🏗️ Architecture

```
omnigent/
├── src/
│   ├── agent/
│   │   └── omnigent.js          # Core agent logic
│   ├── integrations/
│   │   └── github.js            # GitHub integration
│   ├── config/
│   │   ├── loader.js            # Configuration loader
│   │   └── config.json          # Configuration file
│   ├── cli.js                   # CLI interface
│   └── index.js                 # Main framework
├── tests/
│   ├── agent.test.js            # Agent tests
│   └── github.test.js           # GitHub tests
├── config/
│   └── config.json              # Configuration
├── package.json
├── .env.example
└── README.md
```

## 🔧 Configuration

### API Keys
Set your API keys in `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
```

### Custom Model
```json
{
  "model": "claude-3-opus-20250219"
}
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test individual components:
```bash
node --test tests/agent.test.js
node --test tests/github.test.js
```

## 🤝 Features from Source Projects

- **OpenClaw** - Agent orchestration and coordination
- **TinyAGI** - Lightweight reasoning capabilities
- **Hermes Agent** - Advanced agent protocols
- **Claude Code** - Code generation and analysis

## 📖 Documentation

- [API Reference](./docs/API.md)
- [Configuration Guide](./docs/CONFIG.md)
- [Examples](./docs/EXAMPLES.md)

## 🔐 Security

- Never commit `.env` files
- Use GitHub personal access tokens with limited scope
- Rotate API keys regularly
- Use the `.env.example` as template

## 📄 License

MIT - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/Maliot100X/-OmniAgent/issues
- Documentation: See `/docs` folder

---

**OmniAgent** - Empowering AI with unified agent capabilities 🌟
