// server/enhanced-agentdb-service.ts
// Enhanced AgentDB Service with Advanced Features:
// - Vector search with embeddings
// - Causal memory tracking
// - Skill learning
// - Reflexion memory

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
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
 * Enhanced AgentDB Service
 *
 * Extends the basic AgentDB with frontier features:
 * - Vector embeddings and semantic search
 * - Causal reasoning and memory graphs
 * - Skill library with automated learning
 * - Reflexion memory for self-improvement
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
    this.dbPath = dbPath || path.join(__dirname, '..', 'data', 'enhanced-dashboard.db');
    this.db = new Database(this.dbPath);

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

    this.initializeSchema();
  }

  /**
   * Initialize the database schema for advanced features
   */
  private initializeSchema(): void {
    // Agent actions table (for vector search)
    this.db.exec(`
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

      -- Vector embeddings table
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id INTEGER NOT NULL,
        entity_type TEXT NOT NULL,
        embedding BLOB NOT NULL,
        dimension INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_embeddings_entity ON embeddings(entity_type, entity_id);

      -- Causal edges table (from CausalMemoryGraph)
      CREATE TABLE IF NOT EXISTS causal_edges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_memory_id INTEGER NOT NULL,
        from_memory_type TEXT NOT NULL,
        to_memory_id INTEGER NOT NULL,
        to_memory_type TEXT NOT NULL,
        similarity REAL DEFAULT 0,
        uplift REAL,
        confidence REAL DEFAULT 0,
        sample_size INTEGER,
        evidence_ids TEXT,
        confounder_score REAL,
        mechanism TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Causal experiments table
      CREATE TABLE IF NOT EXISTS causal_experiments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        hypothesis TEXT NOT NULL,
        treatment_id INTEGER NOT NULL,
        treatment_type TEXT NOT NULL,
        control_id INTEGER,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        sample_size INTEGER NOT NULL,
        treatment_mean REAL,
        control_mean REAL,
        uplift REAL,
        p_value REAL,
        confidence_interval_low REAL,
        confidence_interval_high REAL,
        status TEXT NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Causal observations table
      CREATE TABLE IF NOT EXISTS causal_observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experiment_id INTEGER NOT NULL,
        episode_id INTEGER NOT NULL,
        is_treatment INTEGER NOT NULL,
        outcome_value REAL NOT NULL,
        outcome_type TEXT NOT NULL,
        context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Skills table (from SkillLibrary)
      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        code TEXT,
        successRate REAL DEFAULT 0,
        uses INTEGER DEFAULT 0,
        avgReward REAL DEFAULT 0,
        avgLatencyMs REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Episodes table (from ReflexionMemory)
      CREATE TABLE IF NOT EXISTS episodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        task TEXT NOT NULL,
        input TEXT,
        output TEXT,
        critique TEXT,
        reward REAL DEFAULT 0,
        success INTEGER DEFAULT 0,
        latency_ms REAL DEFAULT 0,
        tokens_used INTEGER,
        tags TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_episodes_task ON episodes(task);
      CREATE INDEX IF NOT EXISTS idx_episodes_success ON episodes(success);

      -- Episode embeddings table
      CREATE TABLE IF NOT EXISTS episode_embeddings (
        episode_id INTEGER PRIMARY KEY,
        embedding BLOB NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[Enhanced AgentDB] Database initialized at:', this.dbPath);
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
      // Continue without embeddings
      this.initialized = true;
    }
  }

  /**
   * Store an agent action with vector embedding
   */
  async storeAction(action: AgentAction): Promise<number> {
    await this.initialize();

    // Generate embedding for the action description
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
      // Fallback to text search
      return this.textSearchActions(query.query, query.k || 5);
    }

    try {
      const queryEmbedding = await this.embedder.embed(query.query);

      // Get all actions with embeddings
      const stmt = this.db.prepare(`
        SELECT id, timestamp, actionType, description, context, outcome, success, reward, latencyMs, embedding
        FROM agent_actions
        WHERE embedding IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 1000
      `);

      const actions = stmt.all() as (AgentAction & { embedding: Buffer })[];

      // Calculate similarities
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

      // Sort by similarity and return top k
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
      SELECT id, name, description, successRate, uses, avgReward, avgLatencyMs
      FROM skills
      ORDER BY avgReward DESC, successRate DESC
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
