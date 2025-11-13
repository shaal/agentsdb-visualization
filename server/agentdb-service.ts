// server/agentdb-service.ts
// AgentDB Service - Manages database operations and data storage

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DashboardMetric {
  id?: number;
  timestamp: string;
  metricType: 'line' | 'bar' | 'pie';
  category?: string;
  value: number;
  metadata?: string;
}

export interface DashboardData {
  lineChartData: Array<{ timestamp: string; value: number }>;
  barChartData: Array<{ category: string; count: number }>;
  pieChartData: Array<{ category: string; count: number }>;
  totalEvents: number;
  lastUpdated: string;
}

/**
 * AgentDB Service
 *
 * Handles all database operations for dashboard metrics using better-sqlite3.
 * Stores time-series data, categorical data, and provides query methods.
 */
export class AgentDBService {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(__dirname, '..', 'data', 'dashboard.db');
    this.db = new Database(this.dbPath);
    this.initialize();
  }

  /**
   * Initialize the database schema
   */
  private initialize(): void {
    // Create metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        metricType TEXT NOT NULL,
        category TEXT,
        value REAL NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(metricType);
      CREATE INDEX IF NOT EXISTS idx_metrics_category ON metrics(category);
    `);

    console.log('[AgentDB] Database initialized at:', this.dbPath);
  }

  /**
   * Insert a single metric
   */
  insertMetric(metric: DashboardMetric): number {
    const stmt = this.db.prepare(`
      INSERT INTO metrics (timestamp, metricType, category, value, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      metric.timestamp,
      metric.metricType,
      metric.category || null,
      metric.value,
      metric.metadata || null
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Insert multiple metrics in a transaction (batch operation)
   */
  insertMetricsBatch(metrics: DashboardMetric[]): number {
    const insert = this.db.prepare(`
      INSERT INTO metrics (timestamp, metricType, category, value, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = this.db.transaction((items: DashboardMetric[]) => {
      for (const metric of items) {
        insert.run(
          metric.timestamp,
          metric.metricType,
          metric.category || null,
          metric.value,
          metric.metadata || null
        );
      }
    });

    insertMany(metrics);
    return metrics.length;
  }

  /**
   * Get line chart data (time series)
   * Returns the last N data points
   */
  getLineChartData(limit: number = 10): Array<{ timestamp: string; value: number }> {
    const stmt = this.db.prepare(`
      SELECT timestamp, value
      FROM metrics
      WHERE metricType = 'line'
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    const results = stmt.all(limit) as Array<{ timestamp: string; value: number }>;
    return results.reverse(); // Return in chronological order
  }

  /**
   * Get bar chart data (categorical counts)
   * Aggregates the latest values per category
   */
  getBarChartData(): Array<{ category: string; count: number }> {
    const stmt = this.db.prepare(`
      SELECT category, SUM(value) as count
      FROM metrics
      WHERE metricType = 'bar' AND category IS NOT NULL
      GROUP BY category
      ORDER BY category
    `);

    return stmt.all() as Array<{ category: string; count: number }>;
  }

  /**
   * Get pie chart data (categorical distribution)
   */
  getPieChartData(): Array<{ category: string; count: number }> {
    const stmt = this.db.prepare(`
      SELECT category, SUM(value) as count
      FROM metrics
      WHERE metricType = 'pie' AND category IS NOT NULL
      GROUP BY category
      ORDER BY category
    `);

    return stmt.all() as Array<{ category: string; count: number }>;
  }

  /**
   * Get total event count
   */
  getTotalEvents(): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as total FROM metrics
    `);

    const result = stmt.get() as { total: number };
    return result.total;
  }

  /**
   * Get complete dashboard data
   */
  getDashboardData(): DashboardData {
    return {
      lineChartData: this.getLineChartData(10),
      barChartData: this.getBarChartData(),
      pieChartData: this.getPieChartData(),
      totalEvents: this.getTotalEvents(),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Clear old data (keep only last N hours)
   */
  cleanupOldData(hoursToKeep: number = 24): number {
    const cutoffTime = new Date(Date.now() - hoursToKeep * 60 * 60 * 1000).toISOString();

    const stmt = this.db.prepare(`
      DELETE FROM metrics WHERE timestamp < ?
    `);

    const result = stmt.run(cutoffTime);
    return result.changes;
  }

  /**
   * Get database statistics
   */
  getStats(): {
    totalMetrics: number;
    byType: Record<string, number>;
    oldestEntry: string | null;
    newestEntry: string | null;
  } {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as total FROM metrics');
    const total = (totalStmt.get() as { total: number }).total;

    const typeStmt = this.db.prepare(`
      SELECT metricType, COUNT(*) as count
      FROM metrics
      GROUP BY metricType
    `);
    const byTypeResults = typeStmt.all() as Array<{ metricType: string; count: number }>;
    const byType: Record<string, number> = {};
    byTypeResults.forEach(row => {
      byType[row.metricType] = row.count;
    });

    const rangeStmt = this.db.prepare(`
      SELECT
        MIN(timestamp) as oldest,
        MAX(timestamp) as newest
      FROM metrics
    `);
    const range = rangeStmt.get() as { oldest: string | null; newest: string | null };

    return {
      totalMetrics: total,
      byType,
      oldestEntry: range.oldest,
      newestEntry: range.newest,
    };
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
    console.log('[AgentDB] Database connection closed');
  }
}
