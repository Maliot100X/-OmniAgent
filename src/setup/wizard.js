import readline from 'readline';
import ProviderSetup from './provider-setup.js';

export class SetupWizard {
  constructor() {
    this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    this.setup = new ProviderSetup();
  }

  question(query) {
    return new Promise(resolve => this.rl.question(query, resolve));
  }

  async start() {
    console.clear();
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  🚀 OMNIGENT PROVIDER SETUP WIZARD 🚀       ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    const choices = [
      '1. Setup LLM Providers',
      '2. Setup Messaging Platforms',
      '3. Setup OAuth Providers',
      '4. Setup Custom APIs',
      '5. View Configured Providers',
      '6. Test Connections',
      '7. Exit Setup'
    ];

    let running = true;
    while (running) {
      console.log('\n📋 SETUP MENU\n');
      choices.forEach(c => console.log('  ' + c));
      const choice = await this.question('\n➤ Select option (1-7): ');

      switch (choice.trim()) {
        case '1': await this.setupLLM(); break;
        case '2': await this.setupPlatforms(); break;
        case '3': await this.setupOAuth(); break;
        case '4': await this.setupCustomAPIs(); break;
        case '5': await this.viewProviders(); break;
        case '6': await this.testConnections(); break;
        case '7': running = false; break;
        default: console.log('Invalid choice');
      }
    }

    console.log('\n✅ Setup Complete! Start OMNIGENT with: npm start\n');
    this.rl.close();
  }

  async setupLLM() {
    console.log('\n🤖 LLM PROVIDER SETUP\n');
    const llms = ['claude-3-5-sonnet', 'gpt-4-turbo', 'gpt-4o', 'cohere', 'mistral', 'ollama', 'custom'];
    llms.forEach((l, i) => console.log(`  ${i+1}. ${l}`));

    const choice = await this.question('\n➤ Select LLM (1-7): ');
    const selected = llms[parseInt(choice) - 1];
    if (!selected) return;

    const apiKey = await this.question('➤ Enter API Key: ');
    const model = await this.question('➤ Enter Model Name: ');

    const result = this.setup.setupLLM(selected, apiKey, model);
    console.log('\n✅ LLM configured:', result);
  }

  async setupPlatforms() {
    console.log('\n💬 MESSAGING PLATFORM SETUP\n');
    const platforms = ['discord', 'telegram', 'slack', 'teams', 'signal', 'whatsapp', 'email'];
    platforms.forEach((p, i) => console.log(`  ${i+1}. ${p}`));

    const choice = await this.question('\n➤ Select Platform (1-7): ');
    const selected = platforms[parseInt(choice) - 1];
    if (!selected) return;

    const token = await this.question(`➤ Enter ${selected.toUpperCase()} Token: `);
    const config = await this.question('➤ Additional config (optional): ');

    const result = this.setup.setupPlatform(selected, token, config ? JSON.parse(config) : {});
    console.log('\n✅ Platform configured:', result);
  }

  async setupOAuth() {
    console.log('\n🔐 OAUTH PROVIDER SETUP\n');
    const oauths = ['github', 'google', 'discord', 'slack', 'microsoft'];
    oauths.forEach((o, i) => console.log(`  ${i+1}. ${o}`));

    const choice = await this.question('\n➤ Select OAuth Provider (1-5): ');
    const selected = oauths[parseInt(choice) - 1];
    if (!selected) return;

    const clientId = await this.question('➤ Enter Client ID: ');
    const clientSecret = await this.question('➤ Enter Client Secret: ');
    const scope = await this.question('➤ Enter Scopes (space-separated): ');

    const result = this.setup.setupOAuth(selected, clientId, clientSecret, scope);
    console.log('\n✅ OAuth configured:', result);
  }

  async setupCustomAPIs() {
    console.log('\n🔌 CUSTOM API SETUP\n');
    const name = await this.question('➤ API Name: ');
    const baseUrl = await this.question('➤ Base URL: ');
    const apiKey = await this.question('➤ API Key: ');

    const result = this.setup.setupCustomAPI(name, baseUrl, apiKey);
    console.log('\n✅ Custom API configured:', result);
  }

  async viewProviders() {
    console.log('\n📊 CONFIGURED PROVIDERS\n');
    console.log('LLM Providers:', this.setup.listProviders('llm'));
    console.log('Platforms:', this.setup.listProviders('platforms'));
    console.log('OAuth:', this.setup.listProviders('oauth'));
    console.log('Custom APIs:', this.setup.listProviders('apis'));
  }

  async testConnections() {
    console.log('\n🧪 TEST CONNECTIONS\n');
    const type = await this.question('➤ Provider type (llm/platforms/oauth/apis): ');
    const name = await this.question('➤ Provider name: ');

    const result = this.setup.testConnection(type, name);
    console.log('\n✅ Test result:', result);
  }
}

export default SetupWizard;
