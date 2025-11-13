// server/enhanced-data-generator.ts
// Generates semantically meaningful data for AgentDB's advanced features

import { EnhancedAgentDBService, type AgentAction } from './enhanced-agentdb-service.js';
import type { Episode, Skill } from 'agentdb';

/**
 * Enhanced Data Generator
 *
 * Generates realistic agent actions, episodes, and skills for demonstrating
 * AgentDB's advanced capabilities like vector search, causal reasoning, and learning.
 */
export class EnhancedDataGenerator {
  private agentDB: EnhancedAgentDBService;

  // Sample action types and descriptions for realistic data
  private actionTypes = [
    'API_CALL',
    'DATABASE_QUERY',
    'FILE_OPERATION',
    'USER_INTERACTION',
    'COMPUTATION',
    'NETWORK_REQUEST'
  ];

  private actionTemplates = [
    { type: 'API_CALL', desc: 'Fetching user data from authentication service', context: 'user_id: {id}' },
    { type: 'DATABASE_QUERY', desc: 'Querying product catalog for search results', context: 'query: {query}' },
    { type: 'FILE_OPERATION', desc: 'Reading configuration file from disk', context: 'path: /config/app.json' },
    { type: 'USER_INTERACTION', desc: 'Processing user click on navigation menu', context: 'element: {element}' },
    { type: 'COMPUTATION', desc: 'Calculating recommendation scores', context: 'algorithm: collaborative_filtering' },
    { type: 'NETWORK_REQUEST', desc: 'Sending email notification to user', context: 'recipient: {email}' },
    { type: 'API_CALL', desc: 'Updating user preferences in database', context: 'preferences: {prefs}' },
    { type: 'DATABASE_QUERY', desc: 'Fetching order history for analytics', context: 'user_id: {id}, range: 30d' },
    { type: 'FILE_OPERATION', desc: 'Writing logs to file system', context: 'log_level: info' },
    { type: 'COMPUTATION', desc: 'Processing image recognition task', context: 'model: resnet50' },
    { type: 'USER_INTERACTION', desc: 'Validating form input submission', context: 'form: registration' },
    { type: 'NETWORK_REQUEST', desc: 'Calling third-party payment API', context: 'amount: {amount}' },
  ];

  private tasks = [
    'Complete user registration',
    'Process payment transaction',
    'Generate monthly report',
    'Optimize database query',
    'Handle error recovery',
    'Update user profile',
    'Search product catalog',
    'Send notification email'
  ];

  private skills = [
    { name: 'efficient_search', desc: 'Optimized product search with caching' },
    { name: 'error_handling', desc: 'Robust error recovery with retry logic' },
    { name: 'data_validation', desc: 'Input validation and sanitization' },
    { name: 'caching_strategy', desc: 'Multi-layer caching for performance' },
    { name: 'batch_processing', desc: 'Efficient batch operations' }
  ];

  constructor(agentDB: EnhancedAgentDBService) {
    this.agentDB = agentDB;
  }

  /**
   * Generate a random agent action
   */
  private generateAction(): AgentAction {
    const template = this.actionTemplates[Math.floor(Math.random() * this.actionTemplates.length)];
    const success = Math.random() > 0.2; // 80% success rate
    const reward = success ? Math.random() * 10 : -Math.random() * 5;
    const latency = 50 + Math.random() * 450; // 50-500ms

    return {
      timestamp: new Date().toISOString(),
      actionType: template.type,
      description: template.desc,
      context: this.interpolateContext(template.context),
      outcome: success ? 'completed successfully' : 'failed with error',
      success,
      reward,
      latencyMs: latency
    };
  }

  /**
   * Interpolate context variables
   */
  private interpolateContext(context: string): string {
    return context
      .replace('{id}', String(Math.floor(Math.random() * 10000)))
      .replace('{query}', ['laptop', 'phone', 'tablet', 'headphones'][Math.floor(Math.random() * 4)])
      .replace('{element}', ['dashboard', 'settings', 'profile'][Math.floor(Math.random() * 3)])
      .replace('{email}', `user${Math.floor(Math.random() * 100)}@example.com`)
      .replace('{prefs}', '{ theme: dark, lang: en }')
      .replace('{amount}', String((Math.random() * 1000).toFixed(2)));
  }

  /**
   * Generate and store a new action
   */
  async generateAndStoreAction(): Promise<number> {
    const action = this.generateAction();
    return await this.agentDB.storeAction(action);
  }

  /**
   * Generate initial historical data with semantic relationships
   */
  async seedHistoricalData(hours: number = 1): Promise<{
    actions: number;
    causalRelations: number;
    episodes: number;
    skills: number;
  }> {
    console.log(`[Enhanced DataGenerator] Seeding ${hours} hours of data...`);

    const actionIds: number[] = [];
    const episodeIds: number[] = [];

    // Generate actions
    const actionsPerHour = 60;
    const totalActions = hours * actionsPerHour;

    for (let i = 0; i < totalActions; i++) {
      const action = this.generateAction();
      // Backdate actions
      const hoursAgo = (totalActions - i) / actionsPerHour;
      action.timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

      const actionId = await this.agentDB.storeAction(action);
      actionIds.push(actionId);
    }

    // Generate causal relationships (actions that tend to follow others)
    let causalCount = 0;
    for (let i = 1; i < actionIds.length; i++) {
      // Create causal relationships with 20% probability
      if (Math.random() < 0.2 && i > 0) {
        const uplift = (Math.random() * 5) - 1; // -1 to 4
        const confidence = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
        this.agentDB.addCausalRelation(actionIds[i - 1], actionIds[i], uplift, confidence);
        causalCount++;
      }
    }

    // Generate episodes for reflexion learning
    for (let i = 0; i < Math.min(20, totalActions / 10); i++) {
      const task = this.tasks[Math.floor(Math.random() * this.tasks.length)];
      const success = Math.random() > 0.3;
      const reward = success ? Math.random() * 10 : Math.random() * 3;

      const episode: Episode = {
        sessionId: `session_${Math.floor(Math.random() * 100)}`,
        task,
        input: `Input for ${task}`,
        output: success ? `Successfully completed ${task}` : `Failed: ${task}`,
        critique: success ? 'Good execution' : 'Could improve error handling',
        reward,
        success,
        latencyMs: 100 + Math.random() * 900
      };

      const episodeId = await this.agentDB.storeEpisode(episode);
      episodeIds.push(episodeId);
    }

    // Generate skills from high-performing patterns
    let skillCount = 0;
    for (const skillTemplate of this.skills) {
      const skill: Skill = {
        name: skillTemplate.name,
        description: skillTemplate.desc,
        signature: {
          inputs: { data: 'any' },
          outputs: { result: 'any' }
        },
        successRate: 0.7 + Math.random() * 0.3, // 70-100%
        uses: Math.floor(Math.random() * 100),
        avgReward: 3 + Math.random() * 7, // 3-10
        avgLatencyMs: 100 + Math.random() * 400
      };

      await this.agentDB.createSkill(skill);
      skillCount++;
    }

    console.log(`[Enhanced DataGenerator] Seeded:`, {
      actions: actionIds.length,
      causalRelations: causalCount,
      episodes: episodeIds.length,
      skills: skillCount
    });

    return {
      actions: actionIds.length,
      causalRelations: causalCount,
      episodes: episodeIds.length,
      skills: skillCount
    };
  }

  /**
   * Start continuous generation of realistic agent activity
   */
  startContinuousGeneration(intervalMs: number = 3000, callback?: () => void): NodeJS.Timeout {
    console.log(`[Enhanced DataGenerator] Starting continuous generation (every ${intervalMs}ms)`);

    return setInterval(async () => {
      await this.generateAndStoreAction();

      // Occasionally create causal relationships with recent actions
      if (Math.random() < 0.3) {
        const recentActions = this.agentDB.getRecentActions(2);
        if (recentActions.length >= 2) {
          const uplift = (Math.random() * 3) - 0.5;
          const confidence = 0.6 + Math.random() * 0.4;
          this.agentDB.addCausalRelation(
            recentActions[1].id!,
            recentActions[0].id!,
            uplift,
            confidence
          );
        }
      }

      console.log('[Enhanced DataGenerator] Generated new agent action');

      if (callback) {
        callback();
      }
    }, intervalMs);
  }
}
