// src/components/ErrorBoundary.tsx
// Cyberpunk-styled Error Boundary for crash protection

import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '24px',
  background: 'var(--cyber-black)',
  color: 'var(--cyber-text)',
  fontFamily: 'var(--font-body)',
  position: 'relative',
});

const ErrorTerminal = styled(Box)({
  maxWidth: '800px',
  width: '100%',
  background: 'rgba(21, 27, 61, 0.7)',
  border: '2px solid var(--cyber-magenta)',
  boxShadow: '0 0 20px rgba(255, 0, 110, 0.3), inset 0 0 40px rgba(255, 0, 110, 0.05)',
  backdropFilter: 'blur(10px)',
  padding: '24px',
  position: 'relative',
  overflow: 'hidden',
  animation: 'errorGlitch 0.5s ease-in-out',
  '@keyframes errorGlitch': {
    '0%, 100%': { transform: 'translate(0)' },
    '20%': { transform: 'translate(-2px, 2px)' },
    '40%': { transform: 'translate(-2px, -2px)' },
    '60%': { transform: 'translate(2px, 2px)' },
    '80%': { transform: 'translate(2px, -2px)' },
  },
});

const ErrorTitle = styled(Typography)({
  fontFamily: 'var(--font-display)',
  color: 'var(--cyber-magenta)',
  textShadow: '0 0 10px rgba(255, 0, 110, 0.5), 0 0 20px rgba(255, 0, 110, 0.3)',
  textTransform: 'uppercase',
  letterSpacing: '3px',
  marginBottom: '16px',
  animation: 'textFlicker 2s infinite',
  '@keyframes textFlicker': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.8 },
  },
});

const ErrorCode = styled('pre')({
  background: 'rgba(10, 14, 39, 0.8)',
  border: '1px solid var(--cyber-cyan)',
  borderRadius: '4px',
  padding: '16px',
  marginTop: '16px',
  overflow: 'auto',
  maxHeight: '300px',
  color: 'var(--cyber-lime)',
  fontSize: '0.85rem',
  fontFamily: 'var(--font-body)',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'var(--cyber-black-light)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'var(--cyber-cyan)',
    boxShadow: '0 0 5px rgba(0, 247, 255, 0.5)',
  },
});

const RebootButton = styled(Button)({
  marginTop: '24px',
  background: 'transparent',
  border: '2px solid var(--cyber-magenta)',
  color: 'var(--cyber-magenta)',
  padding: '12px 24px',
  fontFamily: 'var(--font-display)',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  position: 'relative',
  overflow: 'hidden',
  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'var(--cyber-magenta)',
    transition: 'left 0.3s',
    zIndex: -1,
  },
  '&:hover': {
    color: 'var(--cyber-black)',
    boxShadow: '0 0 10px rgba(255, 0, 110, 0.5), 0 0 20px rgba(255, 0, 110, 0.3)',
  },
  '&:hover::before': {
    left: 0,
  },
});

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 SYSTEM CRITICAL ERROR:', error);
    console.error('📍 Error Stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReboot = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Reload the page to fully reset state
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <div className="cyber-background" />
          <ErrorTerminal>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#ff5f56',
                  boxShadow: '0 0 10px #ff5f56',
                  mr: 1,
                  animation: 'pulse 1s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'var(--cyber-text-dim)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                SYSTEM_ERROR.LOG
              </Typography>
            </Box>

            <ErrorTitle variant="h4">
              ⚠️ CRITICAL SYSTEM FAILURE
            </ErrorTitle>

            <Typography
              variant="body1"
              sx={{
                color: 'var(--cyber-text)',
                fontFamily: 'var(--font-body)',
                marginBottom: '8px',
              }}
            >
              // The neural core has encountered a fatal exception //
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'var(--cyber-text-dim)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Error: {this.state.error?.message || 'Unknown system error'}
            </Typography>

            {this.state.error && (
              <ErrorCode>
                {`ERROR DETAILS:
─────────────────────────────────────
Name: ${this.state.error.name}
Message: ${this.state.error.message}

STACK TRACE:
${this.state.error.stack || 'No stack trace available'}

${this.state.errorInfo ? `
COMPONENT STACK:
${this.state.errorInfo.componentStack}
` : ''}`}
              </ErrorCode>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <RebootButton onClick={this.handleReboot}>
                🔄 REBOOT SYSTEM
              </RebootButton>

              <Typography
                variant="caption"
                sx={{
                  color: 'var(--cyber-text-dim)',
                  fontFamily: 'var(--font-body)',
                  mt: 2,
                  textAlign: 'center',
                }}
              >
                // If the problem persists, check the browser console for more details //
              </Typography>
            </Box>
          </ErrorTerminal>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                color: 'var(--cyber-text-dim)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '2px',
              }}
            >
              // AGENTDB // ERROR RECOVERY PROTOCOL ACTIVE //
            </Typography>
          </Box>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
