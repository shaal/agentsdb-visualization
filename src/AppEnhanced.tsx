// src/AppEnhanced.tsx
// Main app component for Enhanced AgentDB Dashboard

import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import EnhancedDashboard from './components/EnhancedDashboard';
import { LanguageModeProvider } from './contexts/LanguageModeContext';

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
    info: {
      main: '#81c784',
    },
    success: {
      main: '#66bb6a',
    },
    warning: {
      main: '#ffa726',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
  },
  typography: {
    h3: {
      fontWeight: 700,
      color: '#e0e0e0',
    },
    h6: {
      fontWeight: 600,
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
          backgroundColor: '#1a1a1a',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderRadius: 12,
        },
      },
    },
  },
});

/**
 * Enhanced App Component
 *
 * Showcases AgentDB's advanced features:
 * - Vector search with semantic embeddings
 * - Causal memory graph for reasoning
 * - Skill library with automated learning
 * - Reflexion memory for self-improvement
 */
const AppEnhanced: React.FC = () => {
  const serverUrl = (import.meta as any).env?.VITE_ENHANCED_SERVER_URL || 'http://localhost:3002';

  return (
    <LanguageModeProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <EnhancedDashboard serverUrl={serverUrl} />
      </ThemeProvider>
    </LanguageModeProvider>
  );
};

export default AppEnhanced;
