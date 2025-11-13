// server/enhanced-index.ts
// Enhanced server with AgentDB advanced features

import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { EnhancedAgentDBService } from './enhanced-agentdb-service-v2.js';
import { EnhancedDataGenerator } from './enhanced-data-generator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3002;
const DATA_UPDATE_INTERVAL = 3000;

// Initialize services
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const enhancedDB = new EnhancedAgentDBService();
const dataGenerator = new EnhancedDataGenerator(enhancedDB);

// Initialize and seed data
(async () => {
  await enhancedDB.initialize();

  const stats = enhancedDB.getStats();
  if (stats.totalActions === 0) {
    console.log('[Server] Database is empty, seeding initial data...');
    await dataGenerator.seedHistoricalData(1);
  }
})();

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Track connected clients
const clients = new Set<WebSocket>();

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  console.log('[WebSocket] Client connected. Total clients:', clients.size + 1);
  clients.add(ws);

  // Send initial data
  const initialData = enhancedDB.getStats();
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
 * Broadcast updates to all connected clients
 */
function broadcastUpdate() {
  if (clients.size === 0) return;

  const data = enhancedDB.getStats();
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
// HTTP API Routes
// ============================

/**
 * GET /api/stats
 * Returns enhanced AgentDB statistics
 */
app.get('/api/stats', (req, res) => {
  try {
    const stats = enhancedDB.getStats();
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
 * GET /api/actions/recent
 * Returns recent agent actions
 */
app.get('/api/actions/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const actions = enhancedDB.getRecentActions(limit);
    res.json({
      success: true,
      actions,
    });
  } catch (error) {
    console.error('[API] Error fetching actions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch actions',
    });
  }
});

/**
 * POST /api/actions/search
 * Semantic search using vector embeddings
 */
app.post('/api/actions/search', async (req, res) => {
  try {
    const { query, k, threshold } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }

    const results = await enhancedDB.searchSimilarActions({
      query,
      k: k || 5,
      threshold: threshold || 0.7
    });

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('[API] Error searching actions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search actions',
    });
  }
});

/**
 * GET /api/causal/relations
 * Get causal relationships between actions
 */
app.get('/api/causal/relations', (req, res) => {
  try {
    const minConfidence = parseFloat(req.query.minConfidence as string) || 0.5;
    const relations = enhancedDB.getCausalRelations(minConfidence);
    res.json({
      success: true,
      relations,
    });
  } catch (error) {
    console.error('[API] Error fetching causal relations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch causal relations',
    });
  }
});

/**
 * GET /api/skills
 * Get learned skills
 */
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await enhancedDB.getSkills();
    res.json({
      success: true,
      skills,
    });
  } catch (error) {
    console.error('[API] Error fetching skills:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch skills',
    });
  }
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    clients: clients.size,
    stats: enhancedDB.getStats(),
  });
});

// Start continuous data generation
const generatorInterval = dataGenerator.startContinuousGeneration(
  DATA_UPDATE_INTERVAL,
  () => {
    broadcastUpdate();
  }
);

// Start server
server.listen(PORT, () => {
  console.log('\n===========================================');
  console.log('🚀 Enhanced AgentDB Visualization Server');
  console.log('===========================================');
  console.log(`HTTP API:       http://localhost:${PORT}`);
  console.log(`WebSocket:      ws://localhost:${PORT}`);
  console.log(`Health Check:   http://localhost:${PORT}/health`);
  console.log('===========================================');
  console.log('Advanced Features:');
  console.log('  ✓ Vector Search & Embeddings');
  console.log('  ✓ Causal Memory Tracking');
  console.log('  ✓ Skill Learning');
  console.log('  ✓ Reflexion Memory');
  console.log('===========================================');
  console.log(`Update Interval: ${DATA_UPDATE_INTERVAL}ms`);
  console.log('===========================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  clearInterval(generatorInterval);
  enhancedDB.close();
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[Server] Shutting down gracefully...');
  clearInterval(generatorInterval);
  enhancedDB.close();
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});
