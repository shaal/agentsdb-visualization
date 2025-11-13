// server/data-generator.ts
// Generates realistic mock data and seeds the AgentDB database

import { AgentDBService, DashboardMetric } from './agentdb-service.js';

/**
 * Data Generator
 *
 * Generates realistic mock data for dashboard visualization.
 * Can seed initial data and continuously generate new data points.
 */
export class DataGenerator {
  private agentDB: AgentDBService;
  private categories = ['Category A', 'Category B', 'Category C', 'Category D'];

  constructor(agentDB: AgentDBService) {
    this.agentDB = agentDB;
  }

  /**
   * Generate initial historical data
   * Creates data for the past N hours
   */
  seedHistoricalData(hours: number = 1): number {
    console.log(`[DataGenerator] Seeding ${hours} hours of historical data...`);

    const metrics: DashboardMetric[] = [];
    const now = Date.now();
    const intervalMs = (hours * 60 * 60 * 1000) / 60; // One data point per minute

    // Generate line chart data (time series)
    for (let i = 60; i >= 0; i--) {
      const timestamp = new Date(now - i * intervalMs).toISOString();
      metrics.push({
        timestamp,
        metricType: 'line',
        value: Math.floor(Math.random() * 100) + 20, // 20-120
      });
    }

    // Generate bar chart data (categorical)
    this.categories.forEach(category => {
      metrics.push({
        timestamp: new Date(now).toISOString(),
        metricType: 'bar',
        category,
        value: Math.floor(Math.random() * 500) + 100, // 100-600
      });
    });

    // Generate pie chart data (categorical)
    this.categories.forEach(category => {
      metrics.push({
        timestamp: new Date(now).toISOString(),
        metricType: 'pie',
        category,
        value: Math.floor(Math.random() * 300) + 50, // 50-350
      });
    });

    const count = this.agentDB.insertMetricsBatch(metrics);
    console.log(`[DataGenerator] Seeded ${count} metrics`);

    return count;
  }

  /**
   * Generate a new set of real-time data
   * Returns the newly generated metrics
   */
  generateRealtimeData(): DashboardMetric[] {
    const now = new Date().toISOString();
    const metrics: DashboardMetric[] = [];

    // Generate new line chart data point
    metrics.push({
      timestamp: now,
      metricType: 'line',
      value: Math.floor(Math.random() * 100) + 20,
    });

    // Update bar chart data (incremental changes)
    this.categories.forEach(category => {
      metrics.push({
        timestamp: now,
        metricType: 'bar',
        category,
        value: Math.floor(Math.random() * 50) - 25, // -25 to +25 change
      });
    });

    // Update pie chart data
    this.categories.forEach(category => {
      metrics.push({
        timestamp: now,
        metricType: 'pie',
        category,
        value: Math.floor(Math.random() * 30) - 15, // -15 to +15 change
      });
    });

    // Insert into database
    this.agentDB.insertMetricsBatch(metrics);

    return metrics;
  }

  /**
   * Start continuous data generation
   * Generates new data every interval (in milliseconds)
   */
  startContinuousGeneration(intervalMs: number = 3000, callback?: () => void): NodeJS.Timeout {
    console.log(`[DataGenerator] Starting continuous generation (every ${intervalMs}ms)`);

    return setInterval(() => {
      this.generateRealtimeData();
      console.log('[DataGenerator] Generated new data point');

      if (callback) {
        callback();
      }
    }, intervalMs);
  }

  /**
   * Generate a complete dashboard snapshot
   */
  generateSnapshot() {
    const now = new Date().toISOString();
    const metrics: DashboardMetric[] = [];

    // Generate 10 time series points
    for (let i = 9; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 1000).toISOString();
      metrics.push({
        timestamp,
        metricType: 'line',
        value: Math.floor(Math.random() * 100) + 20,
      });
    }

    // Generate categorical data
    this.categories.forEach(category => {
      metrics.push({
        timestamp: now,
        metricType: 'bar',
        category,
        value: Math.floor(Math.random() * 500) + 100,
      });

      metrics.push({
        timestamp: now,
        metricType: 'pie',
        category,
        value: Math.floor(Math.random() * 300) + 50,
      });
    });

    return metrics;
  }
}
