# Usage Guide - AgentDB Visualization Dashboard

This guide explains how to use both connection modes (WebSocket and HTTP Polling) with the real AgentDB backend.

## What Changed from Mock to Real AgentDB

### Before (Mock Implementation)
```typescript
// Mock client with fake data generation
const client = new MockAgentDBClient();
client.liveQuery(path).onUpdate(callback);
```

### After (Real AgentDB Implementation)
```typescript
// Real AgentDB with SQLite backend
const agentDB = new AgentDBService();
const data = agentDB.getDashboardData();

// WebSocket for real-time updates
wss.on('connection', (ws) => {
  ws.send(JSON.stringify(data));
});

// HTTP API for polling
app.get('/api/dashboard', (req, res) => {
  res.json({ success: true, data });
});
```

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   React Frontend                      │
│              (http://localhost:5173)                  │
└───────────────┬─────────────────┬────────────────────┘
                │                 │
        ┌───────▼──────┐   ┌──────▼──────┐
        │  WebSocket   │   │  HTTP API   │
        │   Real-time  │   │   Polling   │
        │  (ws://...)  │   │ (http://...)│
        └───────┬──────┘   └──────┬──────┘
                │                 │
                └────────┬────────┘
                         │
        ┌────────────────▼────────────────┐
        │      Express Server             │
        │   (http://localhost:3001)       │
        │                                 │
        │  ┌──────────────────────────┐  │
        │  │   AgentDBService         │  │
        │  │  (better-sqlite3)        │  │
        │  └────────┬─────────────────┘  │
        │           │                     │
        │  ┌────────▼─────────────────┐  │
        │  │   DataGenerator          │  │
        │  │  (continuous updates)    │  │
        │  └──────────────────────────┘  │
        └─────────────────────────────────┘
                         │
                ┌────────▼────────┐
                │  SQLite DB      │
                │ dashboard.db    │
                │  (/data/)       │
                └─────────────────┘
```

## Running the Application

### Option 1: Run Everything Together (Recommended)

```bash
npm run dev:all
```

This starts:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`

Open `http://localhost:5173` in your browser.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Connection Modes Explained

### 1. WebSocket Mode (Default - Recommended)

**How it works:**
1. Client connects to `ws://localhost:3001`
2. Server immediately sends initial data
3. Server broadcasts updates every 3 seconds
4. Client receives and displays updates in real-time

**Advantages:**
- **Sub-50ms latency**: Updates arrive almost instantly
- **Efficient**: Only sends data when it changes
- **Automatic reconnection**: Handles network interruptions
- **Lower bandwidth**: Persistent connection, no HTTP overhead

**When to use:**
- Modern browsers (all browsers since 2012)
- Real-time monitoring dashboards
- Applications requiring instant updates
- When you control both client and server

**Example in the UI:**
```
┌─────────────────────────────────────┐
│ Real-time AgentDB Dashboard         │
│                          [CONNECTED] │
│ ┌─────────────┐  ┌────────────────┐│
│ │ WebSocket   │  │ Polling        ││
│ │(Real-time)  │  │ (HTTP)         ││
│ └─────────────┘  └────────────────┘│
└─────────────────────────────────────┘
```

### 2. HTTP Polling Mode (Fallback)

**How it works:**
1. Client sends GET request to `http://localhost:3001/api/dashboard`
2. Server returns current dashboard data
3. Client waits 3 seconds
4. Repeat from step 1

**Advantages:**
- **Universal compatibility**: Works with all HTTP clients
- **Simple debugging**: Easy to test with curl/Postman
- **Firewall friendly**: Standard HTTP requests
- **Stateless**: No persistent connections needed

**When to use:**
- Testing/debugging
- Environments with WebSocket restrictions
- Simple HTTP-only clients
- When reliability > real-time performance

**Example API call:**
```bash
curl http://localhost:3001/api/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lineChartData": [
      { "timestamp": "2025-01-13T10:00:00Z", "value": 45 },
      ...
    ],
    "barChartData": [
      { "category": "Category A", "count": 250 }
    ],
    "pieChartData": [
      { "category": "Category A", "count": 150 }
    ],
    "totalEvents": 132,
    "lastUpdated": "2025-01-13T10:05:30Z"
  },
  "timestamp": "2025-01-13T10:05:30Z"
}
```

## Switching Between Modes

You can switch between WebSocket and Polling modes **on-the-fly** in the UI:

1. Look for the toggle buttons in the top-right corner
2. Click "WebSocket (Real-time)" or "Polling (HTTP)"
3. The dashboard will instantly switch connection modes
4. Connection status indicator shows current state

## Data Flow

### WebSocket Flow
```
Server generates data (every 3s)
    ↓
AgentDB stores in SQLite
    ↓
Server broadcasts to ALL connected clients
    ↓
React receives update via WebSocket
    ↓
Charts re-render with new data
```

### Polling Flow
```
React timer triggers (every 3s)
    ↓
HTTP GET /api/dashboard
    ↓
Server queries AgentDB
    ↓
Server returns JSON response
    ↓
React processes response
    ↓
Charts re-render with new data
```

## AgentDB Integration Details

### Database Schema
```sql
CREATE TABLE metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  metricType TEXT NOT NULL,  -- 'line', 'bar', or 'pie'
  category TEXT,             -- For bar/pie charts
  value REAL NOT NULL,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Data Generation
The server continuously generates three types of metrics:

1. **Line Chart** (`metricType: 'line'`)
   - One data point every 3 seconds
   - Random values between 20-120
   - Represents time-series metrics

2. **Bar Chart** (`metricType: 'bar'`)
   - Four categories (A, B, C, D)
   - Incremental updates (-25 to +25)
   - Shows categorical distribution

3. **Pie Chart** (`metricType: 'pie'`)
   - Four categories (A, B, C, D)
   - Incremental updates (-15 to +15)
   - Shows proportional data

## API Reference

### GET /api/dashboard
Returns complete dashboard data.

### GET /api/stats
Returns database statistics:
```json
{
  "success": true,
  "stats": {
    "totalMetrics": 132,
    "byType": {
      "line": 60,
      "bar": 36,
      "pie": 36
    },
    "oldestEntry": "2025-01-13T09:00:00Z",
    "newestEntry": "2025-01-13T10:05:30Z"
  }
}
```

### POST /api/seed
Manually seed historical data:
```bash
curl -X POST http://localhost:3001/api/seed \
  -H "Content-Type: application/json" \
  -d '{"hours": 2}'
```

### DELETE /api/cleanup
Remove old data:
```bash
curl -X DELETE http://localhost:3001/api/cleanup \
  -H "Content-Type: application/json" \
  -d '{"hours": 24}'
```

### GET /health
Health check and server status:
```json
{
  "status": "ok",
  "timestamp": "2025-01-13T10:05:30Z",
  "clients": 2,
  "stats": { ... }
}
```

## Troubleshooting

### WebSocket won't connect
```bash
# Check if server is running
curl http://localhost:3001/health

# Check WebSocket with wscat (install: npm install -g wscat)
wscat -c ws://localhost:3001
```

### Polling returns errors
```bash
# Test the API directly
curl http://localhost:3001/api/dashboard

# Check server logs for errors
npm run dev:server
```

### Database issues
```bash
# Check if database exists
ls -lh data/dashboard.db

# View database stats
curl http://localhost:3001/api/stats

# Reset database (delete and restart)
rm -f data/dashboard.db
npm run dev:server
```

### Charts not updating
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for requests/responses
4. Verify server is generating data (check server logs)
5. Try switching between WebSocket and Polling modes

## Performance Comparison

| Metric | WebSocket | Polling |
|--------|-----------|---------|
| Latency | 10-50ms | 1-3s |
| Bandwidth | ~1KB/update | ~2KB/request |
| CPU Usage | Low | Medium |
| Battery Impact | Minimal | Moderate |
| Scalability | Excellent (1000s clients) | Good (100s clients) |

## Next Steps

1. **Customize Data**: Modify `server/data-generator.ts` to generate your own data patterns
2. **Add Charts**: Create new chart types in `DashboardNew.tsx`
3. **Extend API**: Add new endpoints in `server/index.ts`
4. **Real Data**: Replace mock data with real metrics from your application
5. **Deploy**: Build for production and deploy to your server

## Additional Resources

- [AgentDB GitHub](https://github.com/ruvnet/agentic-flow)
- [WebSocket MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Material-UI Components](https://mui.com/material-ui/getting-started/)
