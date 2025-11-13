# Enhanced AgentDB Features

This document describes the advanced AgentDB features implemented in this visualization dashboard.

## Quick Start

### Run the Enhanced Dashboard

```bash
# Terminal 1: Start enhanced server (port 3002)
npm run dev:enhanced

# Terminal 2: Start frontend
npm run dev

# Or run both together
npm run dev:enhanced:all
```

Then navigate to: `http://localhost:5173/index-enhanced.html`

## Features Overview

### 1. Vector Search & Embeddings 🔍

**What it does:**
- Converts agent actions into semantic vector embeddings using neural models
- Enables similarity-based search using cosine similarity
- Finds conceptually similar actions even if they use different words

**Example:**
```typescript
// Search for "database operations"
// Will find: "Querying product catalog", "Fetching user data", etc.
await enhancedDB.searchSimilarActions({
  query: "database operations",
  k: 5,
  threshold: 0.7
});
```

**Implementation:**
- Uses `EmbeddingService` with local transformers.js model (all-MiniLM-L6-v2)
- 384-dimensional vectors
- WASM-accelerated similarity calculations (150x faster)
- Automatic embedding generation on data insert

**UI Features:**
- Real-time semantic search box
- Similarity scores displayed as percentages
- Results ranked by semantic relevance

---

### 2. Causal Memory Tracking 🧠

**What it does:**
- Tracks cause-and-effect relationships between actions
- Uses intervention-based reasoning (Pearl's do-calculus)
- Measures causal uplift: how much one action improves outcomes

**Example:**
```typescript
// Record that "caching" causes "faster response"
enhancedDB.addCausalRelation(
  cachingActionId,
  fasterResponseId,
  uplift: 2.5,  // 2.5x improvement
  confidence: 0.85
);
```

**Implementation:**
- Uses `CausalMemoryGraph` from AgentDB
- Stores causal edges with uplift metrics
- Tracks confidence levels and sample sizes
- Supports multi-hop causal chains

**UI Features:**
- Live causal relationship graph
- Uplift indicators (green for positive, red for negative)
- Confidence percentages
- Automatic updates every 5 seconds

---

### 3. Skill Library 📚

**What it does:**
- Automatically extracts reusable skills from successful episodes
- Tracks skill performance metrics
- Manages skill relationships (prerequisites, alternatives)

**Example:**
```typescript
// Create a new skill
await enhancedDB.createSkill({
  name: 'efficient_search',
  description: 'Optimized product search with caching',
  successRate: 0.92,
  avgReward: 8.5,
  uses: 150
});
```

**Implementation:**
- Uses `SkillLibrary` from AgentDB
- Stores skills with success metrics
- Tracks usage patterns and average rewards
- Supports skill composition and relationships

**UI Features:**
- Real-time skills table
- Success rate indicators with color coding
- Average reward and usage statistics
- Sortable by performance

---

### 4. Reflexion Memory 🔄

**What it does:**
- Stores episodic memory of agent attempts
- Records self-critiques and outcomes
- Enables learning from past failures

**Example:**
```typescript
// Store an episode with critique
await enhancedDB.storeEpisode({
  sessionId: 'session_123',
  task: 'Process payment transaction',
  success: true,
  reward: 9.5,
  critique: 'Good error handling, but could optimize latency'
});
```

**Implementation:**
- Uses `ReflexionMemory` from AgentDB
- Stores episodes with embeddings
- Enables retrieval of relevant past experiences
- Tracks improvement trends over time

**Backend Features:**
- Automatic episode storage
- Task-based statistics
- Improvement trend analysis
- Critique summarization

---

## Architecture

```
┌─────────────────────────────────────┐
│   React Frontend (Enhanced UI)     │
│   - Vector Search Interface         │
│   - Causal Graph Visualization      │
│   - Skills Dashboard                │
└──────────────┬──────────────────────┘
               │
               │ HTTP/WebSocket
               │
┌──────────────▼──────────────────────┐
│   Enhanced Express Server           │
│   Port: 3002                        │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ EnhancedAgentDBService      │  │
│   │                             │  │
│   │  ┌────────────────────┐    │  │
│   │  │ EmbeddingService   │    │  │
│   │  │ (Transformers.js)  │    │  │
│   │  └────────────────────┘    │  │
│   │                             │  │
│   │  ┌────────────────────┐    │  │
│   │  │ WASMVectorSearch   │    │  │
│   │  │ (150x faster)      │    │  │
│   │  └────────────────────┘    │  │
│   │                             │  │
│   │  ┌────────────────────┐    │  │
│   │  │ CausalMemoryGraph  │    │  │
│   │  │ (Causal reasoning) │    │  │
│   │  └────────────────────┘    │  │
│   │                             │  │
│   │  ┌────────────────────┐    │  │
│   │  │ SkillLibrary       │    │  │
│   │  │ (Learning system)  │    │  │
│   │  └────────────────────┘    │  │
│   │                             │  │
│   │  ┌────────────────────┐    │  │
│   │  │ ReflexionMemory    │    │  │
│   │  │ (Self-improvement) │    │  │
│   │  └────────────────────┘    │  │
│   └─────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │
      ┌────────▼────────┐
      │  SQLite DB      │
      │  (384-dim       │
      │   embeddings)   │
      └─────────────────┘
```

## API Endpoints

### GET /api/stats
Returns system statistics including counts and feature flags.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalActions": 1250,
    "totalSkills": 5,
    "totalEpisodes": 42,
    "totalCausalEdges": 187,
    "vectorSearchEnabled": true,
    "wasmEnabled": true
  }
}
```

### POST /api/actions/search
Semantic search using vector embeddings.

**Request:**
```json
{
  "query": "database query",
  "k": 5,
  "threshold": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": 123,
      "description": "Querying product catalog for search results",
      "actionType": "DATABASE_QUERY",
      "success": true,
      "reward": 8.5,
      "similarity": 0.92
    }
  ]
}
```

### GET /api/causal/relations
Get causal relationships between actions.

**Query Parameters:**
- `minConfidence` (float, default: 0.5) - Minimum confidence threshold

**Response:**
```json
{
  "success": true,
  "relations": [
    {
      "from": "Implementing caching strategy",
      "to": "Reduced response latency",
      "uplift": 2.5,
      "confidence": 0.85
    }
  ]
}
```

### GET /api/skills
Get learned skills from the skill library.

**Response:**
```json
{
  "success": true,
  "skills": [
    {
      "id": 1,
      "name": "efficient_search",
      "description": "Optimized product search with caching",
      "successRate": 0.92,
      "uses": 150,
      "avgReward": 8.5
    }
  ]
}
```

### GET /api/actions/recent
Get recent agent actions.

**Query Parameters:**
- `limit` (int, default: 20) - Number of actions to return

## Performance Metrics

- **Embedding Generation**: ~50ms per text (local model)
- **Vector Search**: ~2ms for 1000 vectors (WASM)
- **Causal Graph Query**: ~5ms
- **Database Size**: ~2-5 MB for 10k actions with embeddings

## Technologies Used

### Backend
- **AgentDB 1.6.1**: Advanced memory features
- **better-sqlite3**: Fast local database
- **Transformers.js**: Local ML model inference
- **WASM**: Accelerated vector operations

### Frontend
- **React + TypeScript**
- **Material-UI**: Modern component library
- **Real-time WebSocket updates**

## Comparison: Basic vs Enhanced

| Feature | Basic Dashboard | Enhanced Dashboard |
|---------|----------------|-------------------|
| Data Storage | Simple metrics | Semantic embeddings |
| Search | Text-based | Vector similarity |
| Relationships | None | Causal reasoning |
| Learning | None | Skill extraction |
| Memory | None | Reflexion episodes |
| Performance | Good | Optimized (WASM) |

## Next Steps

1. **Integrate Real Data**: Replace mock data with actual agent logs
2. **Add Visualizations**: Graph view for causal relationships
3. **Implement A/B Testing**: Causal experiment framework
4. **Add Skill Composition**: Combine skills into workflows
5. **Deploy to Production**: Scale with PostgreSQL + pgvector

## Learn More

- [AgentDB GitHub](https://github.com/ruvnet/agentic-flow)
- [Reflexion Paper](https://arxiv.org/abs/2303.11366)
- [Voyager Paper (Skills)](https://arxiv.org/abs/2305.16291)
- [Pearl's Causality](http://bayes.cs.ucla.edu/BOOK-2K/)
