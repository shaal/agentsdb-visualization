// server/enhanced-agentdb-service-v2.ts
// Enhanced AgentDB Service using official schemas (RECOMMENDED APPROACH)

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import {
  EmbeddingService,
  WASMVectorSearch,
  CausalMemoryGraph,
  SkillLibrary,
  ReflexionMemory,
  type CausalEdge,
  type Skill,
  type Episode
} from 'agentdb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AgentAction {
  id?: number;
  timestamp: string;
  actionType: string;
  description: string;
  context?: string;
  outcome?: string;
  success: boolean;
  reward: number;
  latencyMs: number;
}

export interface MemoryQuery {
  query: string;
  k?: number;
  threshold?: number;
}

export interface CausalRelation {
  from: string;
  to: string;
  uplift: number;
  confidence: number;
}

/**
 * Enhanced AgentDB Service (V2 - Using Official Schemas)
 *
 * This version uses AgentDB's official SQL schemas for proper initialization.
 */
export class EnhancedAgentDBService {
  private db: Database.Database;
  private dbPath: string;
  private embedder: EmbeddingService;
  private vectorSearch: WASMVectorSearch;
  private causalGraph: CausalMemoryGraph;
  private skillLibrary: SkillLibrary;
  private reflexionMemory: ReflexionMemory;
  private initialized: boolean = false;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(__dirname, '..', 'data', 'enhanced-dashboard-v2.db');
    this.db = new Database(this.dbPath);

    // Load official AgentDB schemas
    this.initializeWithOfficialSchemas();

    // Initialize AgentDB controllers
    this.embedder = new EmbeddingService({
      model: 'all-MiniLM-L6-v2',
      dimension: 384,
      provider: 'local'
    });

    this.vectorSearch = new WASMVectorSearch(this.db, {
      enableWASM: true,
      enableSIMD: true,
      batchSize: 100,
      indexThreshold: 1000
    });

    this.causalGraph = new CausalMemoryGraph(this.db);
    this.skillLibrary = new SkillLibrary(this.db, this.embedder);
    this.reflexionMemory = new ReflexionMemory(this.db, this.embedder);

    // Initialize custom tables
    this.initializeCustomTables();
  }

  /**
   * Initialize database using AgentDB's official schemas (RECOMMENDED)
   */
  private initializeWithOfficialSchemas(): void {
    try {
      // Load AgentDB's main schema
      const schemaPath = path.join(__dirname, '..', 'node_modules', 'agentdb', 'dist', 'schemas', 'schema.sql');
      const schema = readFileSync(schemaPath, 'utf-8');
      this.db.exec(schema);

      // Load AgentDB's frontier features schema
      const frontierSchemaPath = path.join(__dirname, '..', 'node_modules', 'agentdb', 'dist', 'schemas', 'frontier-schema.sql');
      const frontierSchema = readFileSync(frontierSchemaPath, 'utf-8');
      this.db.exec(frontierSchema);

      console.log('[Enhanced AgentDB] Official schemas loaded successfully');
    } catch (error) {
      console.error('[Enhanced AgentDB] Error loading schemas:', error);
      throw error;
    }
  }

  /**
   * Initialize custom tables for our application (agent actions tracking)
   */
  private initializeCustomTables(): void {
    this.db.exec(`
      -- Agent actions table (our custom addition for tracking agent activity)
      CREATE TABLE IF NOT EXISTS agent_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        actionType TEXT NOT NULL,
        description TEXT NOT NULL,
        context TEXT,
        outcome TEXT,
        success INTEGER DEFAULT 0,
        reward REAL DEFAULT 0,
        latencyMs REAL DEFAULT 0,
        embedding BLOB,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_actions_timestamp ON agent_actions(timestamp);
      CREATE INDEX IF NOT EXISTS idx_actions_type ON agent_actions(actionType);
      CREATE INDEX IF NOT EXISTS idx_actions_success ON agent_actions(success);
    `);

    console.log('[Enhanced AgentDB] Custom tables initialized at:', this.dbPath);
  }

  /**
   * Initialize embeddings service (async)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.embedder.initialize();
      this.initialized = true;
      console.log('[Enhanced AgentDB] Embeddings service initialized');
    } catch (error) {
      console.warn('[Enhanced AgentDB] Failed to initialize embeddings:', error);
      this.initialized = true; // Continue without embeddings
    }
  }

  /**
   * Store an agent action with vector embedding
   */
  async storeAction(action: AgentAction): Promise<number> {
    await this.initialize();

    // Generate embedding
    let embeddingBlob: Buffer | null = null;
    if (this.initialized) {
      try {
        const text = `${action.actionType}: ${action.description} ${action.context || ''}`;
        const embedding = await this.embedder.embed(text);
        embeddingBlob = Buffer.from(embedding.buffer);
      } catch (error) {
        console.warn('[Enhanced AgentDB] Failed to generate embedding:', error);
      }
    }

    const stmt = this.db.prepare(`
      INSERT INTO agent_actions (timestamp, actionType, description, context, outcome, success, reward, latencyMs, embedding)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      action.timestamp,
      action.actionType,
      action.description,
      action.context || null,
      action.outcome || null,
      action.success ? 1 : 0,
      action.reward,
      action.latencyMs,
      embeddingBlob
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Semantic search using vector embeddings
   */
  async searchSimilarActions(query: MemoryQuery): Promise<AgentAction[]> {
    await this.initialize();

    if (!this.initialized) {
      return this.textSearchActions(query.query, query.k || 5);
    }

    try {
      const queryEmbedding = await this.embedder.embed(query.query);

      const stmt = this.db.prepare(`
        SELECT id, timestamp, actionType, description, context, outcome, success, reward, latencyMs, embedding
        FROM agent_actions
        WHERE embedding IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 1000
      `);

      const actions = stmt.all() as (AgentAction & { embedding: Buffer })[];
      const results: (AgentAction & { similarity: number })[] = [];

      for (const action of actions) {
        const actionEmbedding = new Float32Array(action.embedding.buffer);
        const similarity = this.vectorSearch.cosineSimilarity(queryEmbedding, actionEmbedding);

        if (query.threshold && similarity < query.threshold) continue;

        results.push({
          ...action,
          similarity
        });
      }

      results.sort((a, b) => b.similarity - a.similarity);
      return results.slice(0, query.k || 5);
    } catch (error) {
      console.error('[Enhanced AgentDB] Vector search failed:', error);
      return this.textSearchActions(query.query, query.k || 5);
    }
  }

  /**
   * Fallback text search
   */
  private textSearchActions(query: string, k: number): AgentAction[] {
    const stmt = this.db.prepare(`
      SELECT id, timestamp, actionType, description, context, outcome, success, reward, latencyMs
      FROM agent_actions
      WHERE description LIKE ? OR context LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    const pattern = `%${query}%`;
    return stmt.all(pattern, pattern, k) as AgentAction[];
  }

  /**
   * Add a causal relationship between actions
   */
  addCausalRelation(fromId: number, toId: number, uplift: number, confidence: number): number {
    const edge: CausalEdge = {
      fromMemoryId: fromId,
      fromMemoryType: 'episode',
      toMemoryId: toId,
      toMemoryType: 'episode',
      similarity: 0.8,
      uplift,
      confidence,
      sampleSize: 1
    };

    return this.causalGraph.addCausalEdge(edge);
  }

  /**
   * Get causal relationships
   */
  getCausalRelations(minConfidence: number = 0.5): CausalRelation[] {
    const stmt = this.db.prepare(`
      SELECT
        a1.description as fromDesc,
        a2.description as toDesc,
        ce.uplift,
        ce.confidence
      FROM causal_edges ce
      JOIN agent_actions a1 ON ce.from_memory_id = a1.id
      JOIN agent_actions a2 ON ce.to_memory_id = a2.id
      WHERE ce.confidence >= ?
      ORDER BY ce.uplift DESC
      LIMIT 20
    `);

    const results = stmt.all(minConfidence) as Array<{
      fromDesc: string;
      toDesc: string;
      uplift: number;
      confidence: number;
    }>;

    return results.map(r => ({
      from: r.fromDesc,
      to: r.toDesc,
      uplift: r.uplift,
      confidence: r.confidence
    }));
  }

  /**
   * Store an episode for reflexion learning
   */
  async storeEpisode(episode: Episode): Promise<number> {
    await this.initialize();
    return await this.reflexionMemory.storeEpisode(episode);
  }

  /**
   * Get learned skills
   */
  async getSkills(): Promise<Skill[]> {
    const stmt = this.db.prepare(`
      SELECT id, name, description, success_rate as successRate, uses, avg_reward as avgReward, avg_latency_ms as avgLatencyMs
      FROM skills
      ORDER BY avg_reward DESC, success_rate DESC
      LIMIT 10
    `);

    return stmt.all() as Skill[];
  }

  /**
   * Create a skill manually
   */
  async createSkill(skill: Skill): Promise<number> {
    await this.initialize();
    return await this.skillLibrary.createSkill(skill);
  }

  /**
   * Get statistics
   */
  getStats() {
    const actionsStmt = this.db.prepare('SELECT COUNT(*) as total FROM agent_actions');
    const skillsStmt = this.db.prepare('SELECT COUNT(*) as total FROM skills');
    const episodesStmt = this.db.prepare('SELECT COUNT(*) as total FROM episodes');
    const causalStmt = this.db.prepare('SELECT COUNT(*) as total FROM causal_edges');

    const actions = (actionsStmt.get() as { total: number }).total;
    const skills = (skillsStmt.get() as { total: number }).total;
    const episodes = (episodesStmt.get() as { total: number }).total;
    const causalEdges = (causalStmt.get() as { total: number }).total;

    return {
      totalActions: actions,
      totalSkills: skills,
      totalEpisodes: episodes,
      totalCausalEdges: causalEdges,
      vectorSearchEnabled: this.initialized,
      wasmEnabled: this.vectorSearch.getStats().wasmAvailable
    };
  }

  /**
   * Get recent actions
   */
  getRecentActions(limit: number = 10): AgentAction[] {
    const stmt = this.db.prepare(`
      SELECT id, timestamp, actionType, description, context, outcome, success, reward, latencyMs
      FROM agent_actions
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    return stmt.all(limit) as AgentAction[];
  }

  /**
   * Close the database
   */
  close(): void {
    this.db.close();
    console.log('[Enhanced AgentDB] Database connection closed');
  }
}
