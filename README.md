# AgentDB Visualization Dashboard

A real-time data visualization dashboard powered by [AgentDB](https://github.com/ruvnet/agentic-flow) with dual connection modes: WebSocket for real-time updates and HTTP polling for compatibility.

## 🎓 New: Educational Features!

This dashboard now includes **kid-friendly explanations** and educational components perfect for teaching AI concepts!

### For Students (Grades 5+):
- 📚 **[README for Kids](README-FOR-KIDS.md)** - Learn how robot brains work with simple language and fun examples!
- 🔄 **ELI5 Mode Toggle** - Switch between technical and kid-friendly language in the dashboard
- 🍕 **Before/After Stories** - See how robots get better (Pizza Delivery & Homework Helper!)
- 🌊 **Animated Data Flow** - Watch how questions travel through the robot's brain

### For Teachers:
- 👩‍🏫 **[Teacher's Guide](README-FOR-TEACHERS.md)** - Complete lesson plans, activities, and discussion guides
- 📊 Aligned with CSTA and NGSS standards
- 🎯 Ready-to-use assessments and rubrics
- 🏫 Perfect for grades 5-8 computer science and STEM classes

### Four "Superpowers" Explained Simply:
1. 🔍 **Super Search** - Finding similar things (Vector Search)
2. 🧠 **Cause & Effect Brain** - Remembering what works (Causal Memory)
3. 🎯 **Trick Collection** - Saving learned skills (Skill Library)
4. 🤔 **Learning from Mistakes** - Getting better (Reflexion)

**Try it now:** Start the dashboard and toggle the "Kid-Friendly" switch in the top right!

---

## Features

- **Real AgentDB Integration** - Uses the actual AgentDB from agentic-flow
- **Dual Connection Modes**:
  - **WebSocket**: Sub-50ms real-time updates (recommended)
  - **HTTP Polling**: Periodic updates via REST API (fallback)
- **Real-time Charts**: Line, Bar, and Pie charts with automatic updates
- **Material-UI Design**: Modern, responsive dark theme interface
- **Better-SQLite3**: Fast local database for metrics storage

## Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Vite + TS)   │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼──┐   ┌──▼────┐
│  WS  │   │ HTTP  │
│Real- │   │Polling│
│time  │   │ API   │
└───┬──┘   └──┬────┘
    │         │
    └────┬────┘
         │
┌────────▼────────┐
│  Express Server │
│  + WebSocket    │
└────────┬────────┘
         │
┌────────▼────────┐
│    AgentDB      │
│ (better-sqlite3)│
│  Data Storage   │
└─────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server (Option A: Server Only)

```bash
npm run dev:server
```

The server will start on `http://localhost:3001` with:
- HTTP API: `http://localhost:3001/api/dashboard`
- WebSocket: `ws://localhost:3001`
- Health Check: `http://localhost:3001/health`

### 3. Start the Frontend (Option B: Frontend Only)

In a separate terminal:

```bash
npm run dev
```

The dashboard will open at `http://localhost:5173`

### 4. Start Both Together (Option C: All-in-One)

```bash
npm run dev:all
```

This runs both the server and frontend concurrently.

## Connection Modes

### WebSocket Mode (Default - Recommended)

**Advantages:**
- Real-time updates (3-second intervals)
- Sub-50ms latency
- Automatic reconnection
- Efficient bandwidth usage

**How it works:**
1. Client establishes WebSocket connection to `ws://localhost:3001`
2. Server broadcasts data updates every 3 seconds
3. Client receives and renders updates immediately

### HTTP Polling Mode (Fallback)

**Advantages:**
- Works through restrictive firewalls
- No persistent connection needed
- Simple debugging with browser dev tools

**How it works:**
1. Client polls `http://localhost:3001/api/dashboard` every 3 seconds
2. Server returns current dashboard data
3. Client renders the updated data

**Switch modes in the UI** using the toggle button in the top-right corner.

## API Endpoints

### GET /api/dashboard
Returns complete dashboard data.

**Response:**
```json
{
  "success": true,
  "data": {
    "lineChartData": [
      { "timestamp": "2025-01-13T10:00:00.000Z", "value": 45 }
    ],
    "barChartData": [
      { "category": "Category A", "count": 250 }
    ],
    "pieChartData": [
      { "category": "Category A", "count": 150 }
    ],
    "totalEvents": 1234,
    "lastUpdated": "2025-01-13T10:05:30.000Z"
  },
  "timestamp": "2025-01-13T10:05:30.000Z"
}
```

### GET /api/stats
Returns database statistics.

### POST /api/seed
Seeds historical data.

**Request:**
```json
{ "hours": 1 }
```

### DELETE /api/cleanup
Cleans up old data.

**Request:**
```json
{ "hours": 24 }
```

### GET /health
Health check endpoint.

## Data Model

The dashboard stores three types of metrics in AgentDB:

1. **Line Chart Data** (`metricType: 'line'`)
   - Time-series values
   - Represents real-time metrics over time

2. **Bar Chart Data** (`metricType: 'bar'`)
   - Categorical counts
   - Aggregated values per category

3. **Pie Chart Data** (`metricType: 'pie'`)
   - Categorical distribution
   - Shows proportion of each category

## Project Structure

```
agentsdb-visualization/
├── server/                      # Backend server
│   ├── index.ts                # Express + WebSocket server
│   ├── agentdb-service.ts      # AgentDB integration
│   └── data-generator.ts       # Mock data generator
├── src/                        # Frontend React app
│   ├── components/
│   │   └── DashboardNew.tsx   # Main dashboard component
│   ├── hooks/
│   │   ├── useAgentDBWebSocket.ts  # WebSocket hook
│   │   └── useAgentDBPolling.ts    # Polling hook
│   ├── AppNew.tsx             # Main app component
│   └── main.tsx               # React entry point
├── data/                       # SQLite database (auto-created)
│   └── dashboard.db
└── package.json
```

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
VITE_SERVER_URL=http://localhost:3001
PORT=3001
DATA_UPDATE_INTERVAL=3000
```

## Development

### Build for Production

```bash
# Build frontend
npm run build

# Build server
npm run build:server
```

### Run Tests

```bash
npm test
```

## Technologies Used

- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - Material-UI
  - Chart.js + react-chartjs-2

- **Backend:**
  - Express.js
  - WebSocket (ws)
  - Better-SQLite3
  - AgentDB (from agentic-flow)

- **Database:**
  - SQLite (via better-sqlite3)
  - AgentDB memory engine

## AgentDB Integration

This project uses **AgentDB v1.6.1** from the [agentic-flow](https://github.com/ruvnet/agentic-flow) repository.

AgentDB provides:
- Sub-millisecond memory operations
- Vector search capabilities
- Causal memory tracking
- Reflexion and skill learning

While this dashboard currently uses SQLite for simplicity, AgentDB's full capabilities (vector search, embeddings, causal reasoning) can be integrated for advanced use cases.

## Troubleshooting

### WebSocket Connection Failed
- Ensure the server is running: `npm run dev:server`
- Check if port 3001 is available
- Switch to Polling mode as fallback

### Database Not Found
- The database is auto-created on first run
- Check that the `data/` directory exists
- Ensure write permissions

### Charts Not Updating
- Check browser console for errors
- Verify server is generating data (check server logs)
- Try refreshing the page

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first.
