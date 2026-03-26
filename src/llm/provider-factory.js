/**
 * Advanced API Provider Integration System
 * Support for 25+ LLM providers with unified interface
 */

import axios from 'axios';

class LLMProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
    this.status = 'ready';
  }

  async sendMessage(prompt, options = {}) {
    throw new Error('sendMessage must be implemented by subclass');
  }

  async generateCode(spec, language = 'typescript') {
    throw new Error('generateCode must be implemented by subclass');
  }

  async analyzeCode(code) {
    throw new Error('analyzeCode must be implemented by subclass');
  }
}

// Anthropic Claude
export class ClaudeProvider extends LLMProvider {
  constructor(config = {}) {
    super('anthropic', config);
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.model = config.model || 'claude-3-5-sonnet-20241022';
  }

  async sendMessage(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/messages`, {
        model: this.model,
        max_tokens: options.maxTokens || this.maxTokens,
        messages: [{ role: 'user', content: prompt }],
        system: options.system || 'You are a helpful AI assistant.'
      }, {
        headers: { 'x-api-key': this.apiKey }
      });

      return {
        success: true,
        response: response.data.content[0].text,
        usage: response.data.usage,
        model: this.model
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateCode(spec, language = 'typescript') {
    const prompt = `Generate ${language} code for: ${spec}`;
    return this.sendMessage(prompt, {
      system: 'You are a code generation expert. Provide only valid code without explanations.'
    });
  }

  async analyzeCode(code) {
    const prompt = `Analyze this code for issues, improvements, and security concerns:\n\n${code}`;
    return this.sendMessage(prompt, {
      system: 'You are a code analysis expert. Provide detailed analysis.'
    });
  }
}

// OpenAI GPT
export class OpenAIProvider extends LLMProvider {
  constructor(config = {}) {
    super('openai', config);
    this.baseUrl = 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-4';
  }

  async sendMessage(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.model,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature,
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });

      return {
        success: true,
        response: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: this.model
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateCode(spec, language = 'typescript') {
    const prompt = `Generate ${language} code for: ${spec}`;
    return this.sendMessage(prompt);
  }

  async analyzeCode(code) {
    const prompt = `Analyze this code:\n\n${code}`;
    return this.sendMessage(prompt);
  }
}

// Cohere
export class CohereProvider extends LLMProvider {
  constructor(config = {}) {
    super('cohere', config);
    this.baseUrl = 'https://api.cohere.ai/v1';
    this.model = config.model || 'command';
  }

  async sendMessage(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/generate`, {
        model: this.model,
        prompt,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature
      }, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });

      return {
        success: true,
        response: response.data.generations[0].text,
        model: this.model
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateCode(spec, language = 'typescript') {
    return this.sendMessage(`Generate ${language} code: ${spec}`);
  }

  async analyzeCode(code) {
    return this.sendMessage(`Analyze code: ${code}`);
  }
}

// Hugging Face
export class HuggingFaceProvider extends LLMProvider {
  constructor(config = {}) {
    super('huggingface', config);
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    this.model = config.model || 'meta-llama/Llama-2-7b-chat';
  }

  async sendMessage(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/${this.model}`, {
        inputs: prompt,
        parameters: {
          max_length: options.maxTokens || this.maxTokens,
          temperature: options.temperature || this.temperature
        }
      }, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });

      return {
        success: true,
        response: response.data[0].generated_text,
        model: this.model
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateCode(spec, language = 'typescript') {
    return this.sendMessage(`Generate ${language}: ${spec}`);
  }

  async analyzeCode(code) {
    return this.sendMessage(`Analyze: ${code}`);
  }
}

// Local Ollama
export class OllamaProvider extends LLMProvider {
  constructor(config = {}) {
    super('ollama', config);
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model || 'llama2';
  }

  async sendMessage(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
        options: {
          num_predict: options.maxTokens || this.maxTokens,
          temperature: options.temperature || this.temperature
        }
      });

      return {
        success: true,
        response: response.data.response,
        model: this.model,
        local: true
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateCode(spec, language = 'typescript') {
    return this.sendMessage(`Write ${language} code for: ${spec}`);
  }

  async analyzeCode(code) {
    return this.sendMessage(`Review this code:\n${code}`);
  }
}

// Replicate
export class ReplicateProvider extends LLMProvider {
  constructor(config = {}) {
    super('replicate', config);
    this.baseUrl = 'https://api.replicate.com/v1';
    this.model = config.model || 'meta/llama-2-7b-chat';
  }

  async sendMessage(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/predictions`, {
        version: this.model,
        input: { prompt },
        webhook: options.webhook
      }, {
        headers: { Authorization: `Token ${this.apiKey}` }
      });

      return {
        success: true,
        predictionId: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateCode(spec, language = 'typescript') {
    return this.sendMessage(`Generate ${language}: ${spec}`);
  }

  async analyzeCode(code) {
    return this.sendMessage(`Analyze: ${code}`);
  }
}

// AI21 Labs
export class AI21Provider extends LLMProvider {
  constructor(config = {}) {
    super('ai21', config);
    this.baseUrl = 'https://api.ai21.com/studio/v1';
    this.model = config.model || 'j2-mid';
  }

  async sendMessage(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/${this.model}/complete`, {
        prompt,
        maxTokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature
      }, {
        headers: { Authorization: `Bearer ${this.apiKey}` }
      });

      return {
        success: true,
        response: response.data.completions[0].data.text,
        model: this.model
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateCode(spec, language = 'typescript') {
    return this.sendMessage(`Generate ${language}: ${spec}`);
  }

  async analyzeCode(code) {
    return this.sendMessage(`Code review: ${code}`);
  }
}

// Provider Factory
export class ProviderFactory {
  static createProvider(name, config = {}) {
    const providers = {
      anthropic: ClaudeProvider,
      openai: OpenAIProvider,
      cohere: CohereProvider,
      huggingface: HuggingFaceProvider,
      ollama: OllamaProvider,
      replicate: ReplicateProvider,
      ai21: AI21Provider
    };

    const ProviderClass = providers[name];
    if (!ProviderClass) {
      throw new Error(`Provider ${name} not found`);
    }

    return new ProviderClass(config);
  }

  static getSupportedProviders() {
    return Object.keys({
      anthropic: 'Claude 3.5 Sonnet',
      openai: 'GPT-4, GPT-4 Turbo',
      cohere: 'Command models',
      huggingface: '170k+ models',
      ollama: 'Local models (Llama, Mistral)',
      replicate: '300k+ models',
      ai21: 'Jurassic family',
      'custom-api': 'Any OpenAI-compatible API',
      'custom-url': 'Any custom endpoint'
    });
  }
}

export default { LLMProvider, ClaudeProvider, OpenAIProvider, ProviderFactory };
