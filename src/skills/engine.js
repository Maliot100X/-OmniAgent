/**
 * Advanced Skills Engine
 * Dynamic skill creation, learning, and adaptation
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';

class SkillsEngine {
  constructor() {
    this.skills = {};
    this.skillsDir = path.join(process.env.HOME || process.env.USERPROFILE, '.omnigent', 'skills');
    this.learningHistory = [];
  }

  /**
   * Initialize skills engine
   */
  async initialize() {
    if (!fs.existsSync(this.skillsDir)) {
      fs.mkdirSync(this.skillsDir, { recursive: true });
    }
    return { success: true };
  }

  /**
   * Create new skill dynamically
   */
  createSkill(name, code, metadata = {}) {
    const skillId = `skill_${Date.now()}`;
    
    this.skills[skillId] = {
      name,
      code,
      metadata,
      created: new Date().toISOString(),
      lastUsed: null,
      usage: 0,
      successRate: 100,
      performance: []
    };

    // Save to file
    const skillPath = path.join(this.skillsDir, `${name}.js`);
    fs.writeFileSync(skillPath, code);

    return {
      success: true,
      skillId,
      name,
      path: skillPath
    };
  }

  /**
   * Execute skill
   */
  async executeSkill(skillId, input = {}) {
    const skill = this.skills[skillId];
    if (!skill) {
      return { success: false, error: 'Skill not found' };
    }

    try {
      const startTime = Date.now();

      // Create sandbox context
      const context = {
        input,
        output: {},
        console: console,
        require: require
      };

      const sandbox = vm.createContext(context);
      vm.runInContext(skill.code, sandbox, { timeout: 5000 });

      const duration = Date.now() - startTime;

      skill.usage++;
      skill.lastUsed = new Date().toISOString();
      skill.performance.push(duration);

      return {
        success: true,
        skillId,
        output: context.output,
        duration
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Learn from execution
   */
  async learnFromExecution(result, feedback = {}) {
    this.learningHistory.push({
      result,
      feedback,
      timestamp: new Date().toISOString(),
      improvement: feedback.rating || 0
    });

    // Analyze patterns
    if (this.learningHistory.length > 10) {
      const avgRating = this.learningHistory.reduce((sum, l) => sum + l.improvement, 0) / this.learningHistory.length;
      
      return {
        success: true,
        pattern: 'Pattern learned',
        avgRating: Math.round(avgRating * 100) / 100
      };
    }

    return { success: true };
  }

  /**
   * Get skill performance metrics
   */
  getSkillMetrics(skillId) {
    const skill = this.skills[skillId];
    if (!skill) return { success: false, error: 'Skill not found' };

    const perf = skill.performance;
    const avgTime = perf.length > 0 ? Math.round(perf.reduce((a, b) => a + b) / perf.length) : 0;

    return {
      skillId,
      name: skill.name,
      usage: skill.usage,
      avgTime: `${avgTime}ms`,
      minTime: Math.min(...perf),
      maxTime: Math.max(...perf),
      successRate: skill.successRate,
      lastUsed: skill.lastUsed
    };
  }

  /**
   * Suggest skill improvements
   */
  suggestImprovements(skillId) {
    const skill = this.skills[skillId];
    if (!skill) return [];

    const suggestions = [];

    if (skill.usage > 100 && skill.performance.length > 0) {
      const avgTime = skill.performance.reduce((a, b) => a + b) / skill.performance.length;
      if (avgTime > 1000) {
        suggestions.push('Optimize for performance - execution takes >1s on average');
      }
    }

    if (skill.successRate < 95) {
      suggestions.push('Add error handling - success rate below 95%');
    }

    if (!skill.metadata.documentation) {
      suggestions.push('Add documentation for better usability');
    }

    return suggestions;
  }

  /**
   * List all skills
   */
  listSkills() {
    return Object.entries(this.skills).map(([id, skill]) => ({
      id,
      name: skill.name,
      usage: skill.usage,
      created: skill.created,
      lastUsed: skill.lastUsed
    }));
  }

  /**
   * Delete skill
   */
  deleteSkill(skillId) {
    const skill = this.skills[skillId];
    if (!skill) {
      return { success: false, error: 'Skill not found' };
    }

    const skillPath = path.join(this.skillsDir, `${skill.name}.js`);
    if (fs.existsSync(skillPath)) {
      fs.unlinkSync(skillPath);
    }

    delete this.skills[skillId];
    return { success: true, deleted: skill.name };
  }

  /**
   * Export skill for sharing
   */
  exportSkill(skillId) {
    const skill = this.skills[skillId];
    if (!skill) {
      return { success: false, error: 'Skill not found' };
    }

    return {
      success: true,
      skill: {
        name: skill.name,
        code: skill.code,
        metadata: skill.metadata
      }
    };
  }

  /**
   * Import skill
   */
  importSkill(skillData) {
    const { name, code, metadata = {} } = skillData;
    if (!name || !code) {
      return { success: false, error: 'Missing name or code' };
    }

    return this.createSkill(name, code, metadata);
  }
}

export default new SkillsEngine();
