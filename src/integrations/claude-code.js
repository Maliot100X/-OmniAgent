/**
 * Everything Claude Code Integration Module
 * Comprehensive Claude code generation and analysis
 * Extracted and adapted from everything-claude-code project
 */

import Anthropic from "@anthropic-ai/sdk";

export class ClaudeCodeEngine {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    this.client = new Anthropic({ apiKey: this.apiKey });
    this.model = options.model || "claude-3-5-sonnet-20241022";
    this.codeLibrary = {};
    this.generatedCode = [];
    this.capabilities = {
      generation: true,
      analysis: true,
      debugging: true,
      documentation: true,
      testing: true,
    };
  }

  /**
   * Initialize Claude Code Engine
   */
  async initialize() {
    console.log(`💻 Initializing Claude Code Engine`);
    console.log(`   Model: ${this.model}`);
    return true;
  }

  /**
   * Generate code based on requirements
   */
  async generateCode(requirement, language = "javascript") {
    const prompt = `You are an expert ${language} developer. 
Generate production-ready code based on this requirement:
${requirement}

Provide:
1. Clean, well-commented code
2. Best practices and patterns
3. Error handling
4. Type definitions if applicable

Return only the code, no explanations.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });

      const generatedCode = {
        id: `code_${Date.now()}`,
        requirement,
        language,
        code:
          response.content[0].type === "text" ? response.content[0].text : "",
        generatedAt: new Date(),
        tokens: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
        },
      };

      this.generatedCode.push(generatedCode);
      return generatedCode;
    } catch (error) {
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }

  /**
   * Analyze code for issues and improvements
   */
  async analyzeCode(code, language = "javascript") {
    const prompt = `You are an expert code reviewer.
Analyze this ${language} code for:
1. Performance issues
2. Security vulnerabilities
3. Code quality and readability
4. Best practices violations
5. Possible bugs

${code}

Provide specific recommendations.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });

      return {
        code: code.substring(0, 100) + "...",
        analysis:
          response.content[0].type === "text" ? response.content[0].text : "",
        language,
        analyzedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Code analysis failed: ${error.message}`);
    }
  }

  /**
   * Debug code issues
   */
  async debugCode(code, errorMessage, language = "javascript") {
    const prompt = `You are an expert debugger.
Help debug this ${language} code with the following error:

Error: ${errorMessage}

Code:
${code}

Provide:
1. Root cause analysis
2. Fix with explanation
3. Prevention strategies`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });

      return {
        error: errorMessage,
        language,
        debugSolution:
          response.content[0].type === "text" ? response.content[0].text : "",
        debuggedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Code debugging failed: ${error.message}`);
    }
  }

  /**
   * Generate documentation for code
   */
  async generateDocumentation(code, language = "javascript") {
    const prompt = `Generate comprehensive documentation for this ${language} code:

${code}

Include:
1. Function/class descriptions
2. Parameter documentation
3. Return value descriptions
4. Usage examples
5. Error handling details`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });

      return {
        code: code.substring(0, 100) + "...",
        documentation:
          response.content[0].type === "text" ? response.content[0].text : "",
        language,
        documentedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Documentation generation failed: ${error.message}`);
    }
  }

  /**
   * Generate test cases
   */
  async generateTests(code, language = "javascript") {
    const testFramework =
      language === "javascript" ? "jest" : "pytest";
    const prompt = `Generate comprehensive test cases for this ${language} code using ${testFramework}:

${code}

Include:
1. Unit tests
2. Edge cases
3. Error scenarios
4. Integration test examples`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });

      return {
        language,
        framework: testFramework,
        testCode:
          response.content[0].type === "text" ? response.content[0].text : "",
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Test generation failed: ${error.message}`);
    }
  }

  /**
   * Refactor code
   */
  async refactorCode(code, language = "javascript", goal = "readability") {
    const prompt = `Refactor this ${language} code for improved ${goal}:

${code}

Focus on:
1. Code clarity and maintainability
2. DRY principle
3. Performance optimization
4. Design patterns
5. Best practices

Return the refactored code with brief inline comments explaining changes.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });

      return {
        originalCode: code.substring(0, 50) + "...",
        refactoredCode:
          response.content[0].type === "text" ? response.content[0].text : "",
        goal,
        language,
        refactoredAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Code refactoring failed: ${error.message}`);
    }
  }

  /**
   * Store code in library
   */
  storeInLibrary(name, code, metadata = {}) {
    this.codeLibrary[name] = {
      code,
      metadata,
      storedAt: new Date(),
    };
    console.log(`✓ Code stored in library: ${name}`);
    return { name, stored: true };
  }

  /**
   * Retrieve code from library
   */
  retrieveFromLibrary(name) {
    return this.codeLibrary[name] || null;
  }

  /**
   * List library contents
   */
  listLibrary() {
    return Object.keys(this.codeLibrary);
  }

  /**
   * Get engine stats
   */
  getStats() {
    return {
      engine: "ClaudeCodeEngine",
      model: this.model,
      generatedCodeCount: this.generatedCode.length,
      librarySize: Object.keys(this.codeLibrary).length,
      capabilities: this.capabilities,
    };
  }
}

export default ClaudeCodeEngine;
