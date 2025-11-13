// server/index.ts
// Main server entry point - Provides both HTTP API and WebSocket real-time updates

import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { AgentDBService } from './agentdb-service.js';
import { DataGenerator } from './data-generator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3001;
const DATA_UPDATE_INTERVAL = 200; // 200ms - 5 times per second

// Initialize services
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const agentDB = new AgentDBService();
const dataGenerator = new DataGenerator(agentDB);

// Check if database is empty and seed it
const stats = agentDB.getStats();
if (stats.totalMetrics === 0) {
  console.log('[Server] Database is empty, seeding initial data...');
  dataGenerator.seedHistoricalData(1); // Seed 1 hour of historical data
}

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Track connected WebSocket clients
const clients = new Set<WebSocket>();

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log('[WebSocket] Client connected. Total clients:', clients.size + 1);
  clients.add(ws);

  // Send initial data immediately upon connection
  const initialData = agentDB.getDashboardData();
  ws.send(JSON.stringify({
    type: 'initial',
    data: initialData,
  }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log('[WebSocket] Client disconnected. Total clients:', clients.size);
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error);
    clients.delete(ws);
  });
});

/**
 * Broadcast updated data to all connected WebSocket clients
 */
function broadcastUpdate() {
  if (clients.size === 0) return;

  const data = agentDB.getDashboardData();
  const message = JSON.stringify({
    type: 'update',
    data,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log(`[WebSocket] Broadcast to ${clients.size} clients`);
}

// ============================
// HTTP API Routes (for polling)
// ============================

/**
 * GET /api/dashboard
 * Returns complete dashboard data
 */
app.get('/api/dashboard', (req, res) => {
  try {
    const data = agentDB.getDashboardData();
    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
    });
  }
});

/**
 * GET /api/stats
 * Returns database statistics
 */
app.get('/api/stats', (req, res) => {
  try {
    const stats = agentDB.getStats();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[API] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
});

/**
 * POST /api/seed
 * Manually trigger data seeding
 */
app.post('/api/seed', (req, res) => {
  try {
    const { hours = 1 } = req.body;
    const count = dataGenerator.seedHistoricalData(hours);
    res.json({
      success: true,
      message: `Seeded ${count} metrics`,
      count,
    });
  } catch (error) {
    console.error('[API] Error seeding data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed data',
    });
  }
});

/**
 * DELETE /api/cleanup
 * Clean up old data
 */
app.delete('/api/cleanup', (req, res) => {
  try {
    const { hours = 24 } = req.body;
    const deleted = agentDB.cleanupOldData(hours);
    res.json({
      success: true,
      message: `Deleted ${deleted} old metrics`,
      deleted,
    });
  } catch (error) {
    console.error('[API] Error cleaning up data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup data',
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    clients: clients.size,
    stats: agentDB.getStats(),
  });
});

// Start continuous data generation
const generatorInterval = dataGenerator.startContinuousGeneration(
  DATA_UPDATE_INTERVAL,
  () => {
    // Broadcast update to all WebSocket clients after generating new data
    broadcastUpdate();
  }
);

// Start server
server.listen(PORT, () => {
  console.log('\n=================================');
  console.log('🚀 AgentDB Visualization Server');
  console.log('=================================');
  console.log(`HTTP API:       http://localhost:${PORT}`);
  console.log(`WebSocket:      ws://localhost:${PORT}`);
  console.log(`Health Check:   http://localhost:${PORT}/health`);
  console.log('=================================');
  console.log(`Update Interval: ${DATA_UPDATE_INTERVAL}ms`);
  console.log('Real-time Mode:  WebSocket (recommended)');
  console.log('Polling Mode:    HTTP GET /api/dashboard');
  console.log('=================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  clearInterval(generatorInterval);
  agentDB.close();
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[Server] Shutting down gracefully...');
  clearInterval(generatorInterval);
  agentDB.close();
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});
