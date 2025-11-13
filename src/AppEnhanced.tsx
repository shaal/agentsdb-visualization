// src/AppEnhanced.tsx
// Main app component for Classic Enhanced AgentDB Dashboard

import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import ClassicEnhancedDashboard from './components/ClassicEnhancedDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageModeProvider } from './contexts/LanguageModeContext';
import './styles/classic.css';

// Classic editorial theme with elegant typography
const classicTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8B3A3A', // Classic burgundy
    },
    secondary: {
      main: '#1B3B5A', // Classic navy
    },
    success: {
      main: '#2D5016', // Classic forest
    },
    warning: {
      main: '#B8860B', // Classic gold
    },
    error: {
      main: '#8B3A3A', // Classic burgundy
    },
    background: {
      default: '#FAF8F3', // Classic cream
      paper: '#FFFFFF', // Classic paper
    },
    text: {
      primary: '#2C2C2C', // Classic charcoal
      secondary: '#6B6B6B', // Classic gray
    },
  },
  typography: {
    fontFamily: 'var(--font-body)',
    h3: {
      fontFamily: 'var(--font-headline)',
      fontWeight: 900,
      color: '#2C2C2C',
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: 'var(--font-headline)',
      fontWeight: 700,
      color: '#2C2C2C',
    },
    h5: {
      fontFamily: 'var(--font-headline)',
      fontWeight: 700,
      color: '#2C2C2C',
    },
    h6: {
      fontFamily: 'var(--font-headline)',
      fontWeight: 600,
      color: '#1B3B5A',
    },
    body1: {
      fontFamily: 'var(--font-body)',
      color: '#2C2C2C',
      lineHeight: 1.7,
    },
    body2: {
      fontFamily: 'var(--font-body)',
      color: '#6B6B6B',
      lineHeight: 1.7,
    },
    caption: {
      fontFamily: 'var(--font-sans)',
      color: '#6B6B6B',
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FAF8F3',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.01) 2px,
              rgba(0, 0, 0, 0.01) 4px
            )
          `,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

/**
 * Enhanced App Component - Classic Editorial Edition
 *
 * Showcases AgentDB's advanced features with a timeless newspaper-inspired aesthetic:
 * - Vector search with semantic embeddings
 * - Causal memory graph for reasoning
 * - Skill library with automated learning
 * - Real-time action stream in editorial format
 */
const AppEnhanced: React.FC = () => {
  const serverUrl = (import.meta as any).env?.VITE_ENHANCED_SERVER_URL || 'http://localhost:3002';

  return (
    <ErrorBoundary>
      <LanguageModeProvider>
        <ThemeProvider theme={classicTheme}>
          <CssBaseline />
          <ClassicEnhancedDashboard serverUrl={serverUrl} />
        </ThemeProvider>
      </LanguageModeProvider>
    </ErrorBoundary>
  );
};

export default AppEnhanced;
