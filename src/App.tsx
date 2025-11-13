// src/App.tsx (Example Usage)

import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { AgentDB, LiveQuery, AgentDBError } from '@agentdb/client';
import Dashboard from './components/Dashboard';

// Create a simple Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'dark', // Or 'light'
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: '#e0e0e0',
    },
    h6: {
      fontWeight: 500,
      color: '#e0e0e0',
    },
    body1: {
      color: '#bdbdbd',
    },
    body2: {
      color: '#9e9e9e',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2c2c2c',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.5)',
        },
      },
    },
  },
});

/**
 * Mock AgentDB Client (for demonstration purposes)
 * In a real application, you would initialize your actual AgentDB client here.
 */
class MockAgentDBClient extends AgentDB {
  constructor() {
    super({
      // These would be your actual AgentDB connection details
      host: 'localhost',
      port: 8080,
      projectId: 'your-project-id',
      apiKey: 'your-api-key',
    });
    console.log('MockAgentDBClient initialized.');
  }

  // Override liveQuery to simulate real-time data
  liveQuery<T>(path: string): LiveQuery<T> {
    console.log(`MockAgentDBClient: Subscribing to liveQuery for path: ${path}`);
    let intervalId: number;
    let currentData: T | undefined = undefined;
    let updateCallback: ((data: T) => void) | null = null;

    const generateMockData = (): T => {
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const lineChartData = Array.from({ length: 10 }).map((_, i) => ({
        timestamp: new Date(tenMinutesAgo.getTime() + i * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 100) + 20,
      }));

      const categories = ['Category A', 'Category B', 'Category C', 'Category D'];
      const barChartData = categories.map((cat) => ({
        category: cat,
        count: Math.floor(Math.random() * 500) + 100,
      }));
      const pieChartData = categories.map((cat) => ({
        category: cat,
        count: Math.floor(Math.random() * 300) + 50,
      }));

      return {
        lineChartData,
        barChartData,
        pieChartData,
        totalEvents: lineChartData.reduce((sum, d) => sum + d.value, 0) + barChartData.reduce((sum, d) => sum + d.count, 0),
        lastUpdated: now.toISOString(),
      } as T;
    };

    // Simulate initial data fetch
    currentData = generateMockData();

    return {
      onUpdate: (callback: (data: T) => void) => {
        updateCallback = callback;
        // Immediately send initial data
        if (currentData) {
          updateCallback(currentData);
        }

        // Start interval for subsequent updates
        intervalId = setInterval(() => {
          currentData = generateMockData();
          if (updateCallback) {
            updateCallback(currentData);
          }
        }, 200); // Update 5 times per second
        return () => {
          console.log(`MockAgentDBClient: Unsubscribing from liveQuery for path: ${path}`);
          clearInterval(intervalId);
          updateCallback = null;
        };
      },
      onError: (_callback: (err: AgentDBError) => void) => {
        // Store error callback for potential use
        return () => {
          // Cleanup error callback
        };
      },
      get: async () => {
        // Simulate async fetch for initial data
        return new Promise<T>((resolve) => {
          setTimeout(() => resolve(generateMockData()), 500); // Simulate network delay
        });
      }
    };
  }
}

const App: React.FC = () => {
  const [agentdbClient, setAgentdbClient] = useState<AgentDB | null>(null);

  useEffect(() => {
    // Initialize your actual AgentDB client here.
    // For this example, we're using a mock client.
    const client = new MockAgentDBClient();
    setAgentdbClient(client);

    // In a real app, you might handle authentication or connection errors here.
  }, []);

  if (!agentdbClient) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: theme.palette.text.primary }}>
          Initializing AgentDB Client...
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Resets CSS and applies theme background */}
      <Dashboard
        agentdbClient={agentdbClient}
        liveQueryPath="data/dashboard" // The AgentDB path where your dashboard data resides
      />
    </ThemeProvider>
  );
};

export default App;
