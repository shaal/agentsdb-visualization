import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  styled,
  keyframes
} from '@mui/material';
import {
  SentimentVeryDissatisfied,
  SentimentVerySatisfied,
  CheckCircle,
  TrendingUp,
  Restaurant
} from '@mui/icons-material';
import { useLanguageMode } from '../contexts/LanguageModeContext';

const slideIn = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const AnimatedCard = styled(Card)(() => ({
  animation: `${slideIn} 0.5s ease-out`,
  height: '100%',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  }
}));

const ProgressBar = styled(LinearProgress)(() => ({
  height: 10,
  borderRadius: 5,
}));

interface Metric {
  label: string;
  labelEli5: string;
  before: number;
  after: number;
  max: number;
  unit: string;
  inverse?: boolean; // true if lower is better (like errors)
}

interface Scenario {
  title: string;
  titleEli5: string;
  description: string;
  descriptionEli5: string;
  icon: React.ReactNode;
  metrics: Metric[];
}

export const BeforeAfterComparison: React.FC = () => {
  const { mode, getText } = useLanguageMode();
  const [animateValues, setAnimateValues] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimateValues(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const scenarios: Scenario[] = [
    {
      title: 'Pizza Delivery Robot',
      titleEli5: '🍕 Pizza Delivery Robot',
      description: 'Autonomous delivery agent optimizing routes and delivery times',
      descriptionEli5: 'A robot that delivers pizzas to people\'s houses!',
      icon: <Restaurant sx={{ fontSize: 40, color: '#ff6b6b' }} />,
      metrics: [
        {
          label: 'Delivery Time',
          labelEli5: 'How long to deliver',
          before: 45,
          after: 12,
          max: 60,
          unit: 'min',
          inverse: true
        },
        {
          label: 'Route Efficiency',
          labelEli5: 'Finding good shortcuts',
          before: 35,
          after: 92,
          max: 100,
          unit: '%'
        },
        {
          label: 'Customer Satisfaction',
          labelEli5: 'Happy customers',
          before: 60,
          after: 95,
          max: 100,
          unit: '%'
        },
        {
          label: 'Wrong Addresses',
          labelEli5: 'Getting lost',
          before: 8,
          after: 1,
          max: 10,
          unit: 'per day',
          inverse: true
        }
      ]
    },
    {
      title: 'Homework Helper Robot',
      titleEli5: '📚 Homework Helper Robot',
      description: 'Educational AI assistant improving accuracy and response time',
      descriptionEli5: 'A robot that helps you with homework questions!',
      icon: <CheckCircle sx={{ fontSize: 40, color: '#4ecdc4' }} />,
      metrics: [
        {
          label: 'Response Time',
          labelEli5: 'How fast it answers',
          before: 30,
          after: 2,
          max: 30,
          unit: 'sec',
          inverse: true
        },
        {
          label: 'Answer Accuracy',
          labelEli5: 'Getting answers right',
          before: 60,
          after: 95,
          max: 100,
          unit: '%'
        },
        {
          label: 'Similar Question Recall',
          labelEli5: 'Remembering similar questions',
          before: 25,
          after: 88,
          max: 100,
          unit: '%'
        },
        {
          label: 'Learning from Mistakes',
          labelEli5: 'Getting better from errors',
          before: 10,
          after: 85,
          max: 100,
          unit: '%'
        }
      ]
    }
  ];

  const renderMetric = (metric: Metric) => {
    const isGoodImprovement = metric.inverse
      ? metric.after < metric.before
      : metric.after > metric.before;

    const improvementPercent = metric.inverse
      ? ((metric.before - metric.after) / metric.before * 100).toFixed(0)
      : ((metric.after - metric.before) / metric.before * 100).toFixed(0);

    return (
      <Box key={metric.label} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            {mode === 'eli5' ? metric.labelEli5 : metric.label}
          </Typography>
          <Chip
            label={`${isGoodImprovement ? '+' : ''}${improvementPercent}%`}
            color={isGoodImprovement ? 'success' : 'error'}
            size="small"
            icon={isGoodImprovement ? <TrendingUp /> : undefined}
          />
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="error">
              Before: {metric.before}{metric.unit}
            </Typography>
            <SentimentVeryDissatisfied sx={{ fontSize: 20, color: 'error.main' }} />
          </Box>
          <ProgressBar
            variant="determinate"
            value={metric.inverse ? (1 - metric.before / metric.max) * 100 : (metric.before / metric.max) * 100}
            color="error"
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="success.main" fontWeight="bold">
              After: {metric.after}{metric.unit}
            </Typography>
            <SentimentVerySatisfied sx={{ fontSize: 20, color: 'success.main' }} />
          </Box>
          <ProgressBar
            variant="determinate"
            value={animateValues ? (metric.inverse ? (1 - metric.after / metric.max) * 100 : (metric.after / metric.max) * 100) : 0}
            color="success"
          />
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          {getText(
            'Performance Comparison: Before vs After AgentDB',
            '⚡ See How Much Better the Robots Got!'
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getText(
            'Real-world scenarios demonstrating the impact of AgentDB features',
            'Watch how robots learn and get super good at their jobs! 🚀'
          )}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {scenarios.map((scenario, index) => (
          <Grid item xs={12} md={6} key={index}>
            <AnimatedCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {scenario.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {mode === 'eli5' ? scenario.titleEli5 : scenario.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mode === 'eli5' ? scenario.descriptionEli5 : scenario.description}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  {scenario.metrics.map(renderMetric)}
                </Box>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'success.dark',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {getText(
                      '✨ Powered by AgentDB: Vector Search, Causal Memory, Skill Learning & Reflexion',
                      '✨ The robot learned using its Super Brain powers!'
                    )}
                  </Typography>
                </Box>
              </CardContent>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>

      {/* Explanation Box */}
      <Box
        sx={{
          mt: 3,
          p: 3,
          bgcolor: 'primary.dark',
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'primary.main'
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {getText('How Did This Improvement Happen?', '🤔 How Did the Robots Get So Much Better?')}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold" color="primary.light">
                {getText('Vector Search', '🔍 Super Search')}
              </Typography>
              <Typography variant="caption">
                {getText(
                  'Finds similar past experiences',
                  'Remembers similar things it did before'
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold" color="warning.light">
                {getText('Causal Memory', '🧠 Cause & Effect')}
              </Typography>
              <Typography variant="caption">
                {getText(
                  'Learns what causes what',
                  'Knows when I do X, Y happens'
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold" color="success.light">
                {getText('Skill Library', '🎯 Skill Collection')}
              </Typography>
              <Typography variant="caption">
                {getText(
                  'Stores learned techniques',
                  'Collects all the tricks it learned'
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight="bold" color="error.light">
                {getText('Reflexion', '🤔 Learn from Mistakes')}
              </Typography>
              <Typography variant="caption">
                {getText(
                  'Self-critiques failures',
                  'Studies what went wrong to improve'
                )}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
