// src/components/Dashboard.tsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
import { AgentDB } from '@agentdb/client'; // Assuming AgentDB client library
import { useAgentDBLiveQuery } from '../hooks/useAgentDBLiveQuery'; // Custom hook for AgentDB live queries
import {
  Box,
  Grid,
  CircularProgress,
  Typography,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';

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

// Define interfaces for data structures
interface DataPoint {
  timestamp: string; // ISO string or similar for time-series
  value: number;
}

interface CategoryData {
  category: string;
  count: number;
}

interface DashboardData {
  lineChartData: DataPoint[];
  barChartData: CategoryData[];
  pieChartData: CategoryData[];
  totalEvents: number;
  lastUpdated: string;
}

// Styled Paper component for consistent card styling
const ChartCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

interface DashboardProps {
  agentdbClient: AgentDB; // AgentDB client instance
  liveQueryPath: string; // The AgentDB path for live data updates
}

/**
 * Dashboard Component
 *
 * A React functional component that displays real-time data visualizations
 * using Chart.js and integrates with AgentDB for live data updates.
 * It features responsive charts and a clean Material-UI layout.
 */
const Dashboard: React.FC<DashboardProps> = ({
  agentdbClient,
  liveQueryPath,
}) => {
  // State for managing error messages
  const [error, setError] = useState<string | null>(null);

  // Custom hook to subscribe to live data from AgentDB
  // This hook handles loading states, real-time updates, and potential errors.
  const {
    data: liveDashboardData,
    loading,
    error: queryError,
  } = useAgentDBLiveQuery<DashboardData>(agentdbClient, liveQueryPath, {
    // Optional: Add a default value if the initial data is empty
    defaultValue: {
      lineChartData: [],
      barChartData: [],
      pieChartData: [],
      totalEvents: 0,
      lastUpdated: new Date().toISOString(),
    },
    onError: (err: Error) => {
      // Handle errors from the live query hook
      console.error('AgentDB Live Query Error:', err);
      setError(`Failed to fetch live data: ${err.message}`);
    },
  });

  // Effect to update error state from the query hook
  useEffect(() => {
    if (queryError) {
      setError(`Failed to load data: ${queryError.message}`);
    } else {
      setError(null); // Clear error if query is successful
    }
  }, [queryError]);

  // Memoize chart data to prevent unnecessary re-renders of charts
  // when other state changes, but chart data itself hasn't.

  const lineChartData = useMemo(() => {
    if (!liveDashboardData?.lineChartData) {
      return { datasets: [] };
    }
    return {
      labels: liveDashboardData.lineChartData.map((d) =>
        new Date(d.timestamp).toLocaleTimeString()
      ),
      datasets: [
        {
          label: 'Real-time Metrics',
          data: liveDashboardData.lineChartData.map((d) => d.value),
          fill: true,
          backgroundColor: 'rgba(75,192,192,0.2)',
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1, // Smooth lines
        },
      ],
    };
  }, [liveDashboardData?.lineChartData]);

  const barChartData = useMemo(() => {
    if (!liveDashboardData?.barChartData) {
      return { datasets: [] };
    }
    return {
      labels: liveDashboardData.barChartData.map((d) => d.category),
      datasets: [
        {
          label: 'Category Distribution',
          data: liveDashboardData.barChartData.map((d) => d.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [liveDashboardData?.barChartData]);

  const pieChartData = useMemo(() => {
    if (!liveDashboardData?.pieChartData) {
      return { datasets: [] };
    }
    return {
      labels: liveDashboardData.pieChartData.map((d) => d.category),
      datasets: [
        {
          label: 'Category Share',
          data: liveDashboardData.pieChartData.map((d) => d.count),
          backgroundColor: [
            '#FF6384', // Red
            '#36A2EB', // Blue
            '#FFCE56', // Yellow
            '#4BC0C0', // Green
            '#9966FF', // Purple
            '#FF9F40', // Orange
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
        },
      ],
    };
  }, [liveDashboardData?.pieChartData]);

  // Common chart options for responsiveness and styling
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false, // Allows chart to fill parent container
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Chart Title', // This will be overridden per chart
        },
      },
    }),
    []
  );

  // Handle closing of Snackbar error message
  const handleCloseSnackbar = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setError(null);
    },
    []
  );

  if (loading && !liveDashboardData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Real-time AgentDB Dashboard
      </Typography>

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}

      {liveDashboardData && (
        <Grid container spacing={3}>
          {/* General Information Card */}
          <Grid item xs={12} sm={6} md={4}>
            <ChartCard>
              <Typography variant="h6" component="h2" gutterBottom>
                Dashboard Overview
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="body1" align="left">
                  <strong>Total Events:</strong>{' '}
                  {liveDashboardData.totalEvents.toLocaleString()}
                </Typography>
                <Typography variant="body2" align="left">
                  Last Updated:{' '}
                  {new Date(liveDashboardData.lastUpdated).toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Data from AgentDB live stream
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
                        title: {
                          display: true,
                          text: 'Value',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Time',
                        },
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
                        title: {
                          display: true,
                          text: 'Count',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Category',
                        },
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
