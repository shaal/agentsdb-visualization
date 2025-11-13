// src/AppNew.tsx
// Main application component using real AgentDB

import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Dashboard from './components/DashboardNew';

// Create a Material-UI dark theme
const theme = createTheme({
  palette: {
    mode: 'dark',
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
 * Main App Component
 *
 * Integrates with real AgentDB backend server.
 * The server must be running on http://localhost:3001 (by default).
 *
 * To start the server: npm run dev:server
 * To start both server and client: npm run dev:all
 */
const App: React.FC = () => {
  // Get server URL from environment variable or use default
  const serverUrl = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:3001';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dashboard serverUrl={serverUrl} defaultMode="websocket" />
    </ThemeProvider>
  );
};

export default App;
