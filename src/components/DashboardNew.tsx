// src/components/DashboardNew.tsx
// Updated Dashboard component using real AgentDB with WebSocket and Polling support

import React, { useMemo, useCallback, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Box,
  Grid,
  CircularProgress,
  Typography,
  Paper,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAgentDBWebSocket } from '../hooks/useAgentDBWebSocket';
import { useAgentDBPolling } from '../hooks/useAgentDBPolling';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Styled components
const ChartCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const ModeSelector = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

type ConnectionMode = 'websocket' | 'polling';

interface DashboardProps {
  serverUrl?: string;
  defaultMode?: ConnectionMode;
}

/**
 * Dashboard Component (AgentDB-powered)
 *
 * Displays real-time data visualizations using data from AgentDB.
 * Supports two connection modes:
 * 1. WebSocket - Real-time updates (recommended, sub-50ms latency)
 * 2. HTTP Polling - Periodic updates (fallback, good for compatibility)
 */
const Dashboard: React.FC<DashboardProps> = ({
  serverUrl = 'http://localhost:3001',
  defaultMode = 'websocket',
}) => {
  const [mode, setMode] = useState<ConnectionMode>(defaultMode);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Memoize WebSocket callbacks to prevent reconnection loops
  const handleWebSocketError = useCallback(() => {
    setSnackbarMessage('WebSocket error occurred');
    setSnackbarOpen(true);
  }, []);

  const handleWebSocketConnect = useCallback(() => {
    console.log('WebSocket connected');
  }, []);

  const handleWebSocketDisconnect = useCallback(() => {
    console.log('WebSocket disconnected');
  }, []);

  // WebSocket connection
  const websocketUrl = serverUrl.replace('http', 'ws');
  const websocket = useAgentDBWebSocket({
    url: websocketUrl,
    onError: handleWebSocketError,
    onConnect: handleWebSocketConnect,
    onDisconnect: handleWebSocketDisconnect,
  });

  // HTTP Polling connection
  const polling = useAgentDBPolling({
    url: `${serverUrl}/api/dashboard`,
    interval: 3000,
    enabled: mode === 'polling',
    onError: () => {
      setSnackbarMessage('Failed to fetch data');
      setSnackbarOpen(true);
    },
  });

  // Automatic fallback to polling mode if WebSocket fails
  React.useEffect(() => {
    if (mode === 'websocket' && websocket.error && websocket.error.includes('Max reconnection')) {
      console.log('[Dashboard] WebSocket failed, falling back to polling mode');
      setMode('polling');
      setSnackbarMessage('WebSocket connection failed. Switched to polling mode.');
      setSnackbarOpen(true);
    }
  }, [mode, websocket.error]);

  // Select active data source based on mode
  const activeData = mode === 'websocket' ? websocket.data : polling.data;
  const isLoading = mode === 'websocket' ? !activeData : polling.loading;
  const connectionStatus = mode === 'websocket'
    ? (websocket.isConnected ? 'connected' : 'disconnected')
    : (polling.error ? 'error' : 'active');

  const handleModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newMode: ConnectionMode | null) => {
      if (newMode !== null) {
        setMode(newMode);
        setSnackbarMessage(`Switched to ${newMode === 'websocket' ? 'WebSocket' : 'Polling'} mode`);
        setSnackbarOpen(true);
      }
    },
    []
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // Memoize chart data
  const lineChartData = useMemo(() => {
    if (!activeData?.lineChartData) {
      return { datasets: [] };
    }
    return {
      labels: activeData.lineChartData.map((d) =>
        new Date(d.timestamp).toLocaleTimeString()
      ),
      datasets: [
        {
          label: 'Real-time Metrics',
          data: activeData.lineChartData.map((d) => d.value),
          fill: true,
          backgroundColor: 'rgba(75,192,192,0.2)',
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1,
        },
      ],
    };
  }, [activeData?.lineChartData]);

  const barChartData = useMemo(() => {
    if (!activeData?.barChartData) {
      return { datasets: [] };
    }
    return {
      labels: activeData.barChartData.map((d) => d.category),
      datasets: [
        {
          label: 'Category Distribution',
          data: activeData.barChartData.map((d) => d.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [activeData?.barChartData]);

  const pieChartData = useMemo(() => {
    if (!activeData?.pieChartData) {
      return { datasets: [] };
    }
    return {
      labels: activeData.pieChartData.map((d) => d.category),
      datasets: [
        {
          label: 'Category Share',
          data: activeData.pieChartData.map((d) => d.count),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        },
      ],
    };
  }, [activeData?.pieChartData]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Chart Title',
        },
      },
    }),
    []
  );

  if (isLoading && !activeData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <ModeSelector>
        <Typography variant="h4" component="h1">
          Real-time AgentDB Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={connectionStatus.toUpperCase()}
            color={connectionStatus === 'connected' || connectionStatus === 'active' ? 'success' : 'error'}
            size="small"
          />
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            aria-label="connection mode"
            size="small"
          >
            <ToggleButton value="websocket" aria-label="websocket mode">
              WebSocket (Real-time)
            </ToggleButton>
            <ToggleButton value="polling" aria-label="polling mode">
              Polling (HTTP)
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </ModeSelector>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {activeData && (
        <Grid container spacing={3}>
          {/* Dashboard Overview */}
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard>
              <Typography variant="h6" component="h2" gutterBottom>
                Dashboard Overview
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="body1" align="left">
                  <strong>Total Events:</strong>{' '}
                  {activeData.totalEvents.toLocaleString()}
                </Typography>
                <Typography variant="body2" align="left">
                  Last Updated:{' '}
                  {new Date(activeData.lastUpdated).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" align="left" display="block" sx={{ mt: 1 }}>
                  Mode: {mode === 'websocket' ? 'WebSocket (Real-time)' : 'HTTP Polling'}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Data from AgentDB
              </Typography>
            </ChartCard>
          </Grid>

          {/* Line Chart */}
          <Grid item xs={12} sm={6} md={8}>
            <ChartCard>
              <Typography variant="h6" component="h2" gutterBottom>
                Real-time Metric Trend
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <Line
                  data={lineChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Real-time Metric Trend',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Value' },
                      },
                      x: {
                        title: { display: true, text: 'Time' },
                      },
                    },
                  }}
                />
              </Box>
            </ChartCard>
          </Grid>

          {/* Bar Chart */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Typography variant="h6" component="h2" gutterBottom>
                Category Distribution
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <Bar
                  data={barChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Category Distribution',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Count' },
                      },
                      x: {
                        title: { display: true, text: 'Category' },
                      },
                    },
                  }}
                />
              </Box>
            </ChartCard>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Typography variant="h6" component="h2" gutterBottom>
                Category Share
              </Typography>
              <Box sx={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie
                  data={pieChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Category Share',
                      },
                    },
                  }}
                />
              </Box>
            </ChartCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
