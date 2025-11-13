import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  styled,
  keyframes,
  Chip
} from '@mui/material';
import {
  QuestionAnswer,
  Search,
  Memory,
  Psychology,
  CheckCircle,
  AutoAwesome,
  ArrowForward
} from '@mui/icons-material';
import { useLanguageMode } from '../contexts/LanguageModeContext';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const flowAnimation = keyframes`
  0% {
    transform: translateX(-10px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(10px);
    opacity: 0;
  }
`;

const AnimatedIcon = styled(Box)<{ active?: boolean }>(({ active }) => ({
  animation: active ? `${pulse} 1.5s ease-in-out infinite` : 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const FlowArrow = styled(ArrowForward)(({ theme }) => ({
  animation: `${flowAnimation} 1.5s ease-in-out infinite`,
  color: theme.palette.primary.main,
  fontSize: 30,
}));

interface FlowStep {
  label: string;
  labelEli5: string;
  description: string;
  descriptionEli5: string;
  icon: React.ReactNode;
  color: string;
  exampleData?: string;
  exampleDataEli5?: string;
}

export const DataFlowVisualizer: React.FC = () => {
  const { mode, getText } = useLanguageMode();
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const steps: FlowStep[] = [
    {
      label: 'Question Arrives',
      labelEli5: '❓ Someone Asks a Question',
      description: 'User input or event triggers the agent to take action',
      descriptionEli5: 'A person or app asks the robot to help with something!',
      icon: <QuestionAnswer sx={{ fontSize: 50 }} />,
      color: '#3498db',
      exampleData: 'Query: "Find best pizza delivery route"',
      exampleDataEli5: '"How do I deliver this pizza fast?"'
    },
    {
      label: 'Vector Search Activated',
      labelEli5: '🔍 Robot Searches Its Memory',
      description: 'Semantic search through embeddings to find similar past experiences',
      descriptionEli5: 'The robot looks through its brain for similar things it did before!',
      icon: <Search sx={{ fontSize: 50 }} />,
      color: '#9b59b6',
      exampleData: 'Found 5 similar past delivery scenarios (similarity: 0.89)',
      exampleDataEli5: 'Found 5 times it delivered to similar places!'
    },
    {
      label: 'Causal Memory Check',
      labelEli5: '🧠 Remembers What Worked',
      description: 'Analyzes cause-and-effect relationships from past actions',
      descriptionEli5: 'Remembers: "When I took the highway, deliveries were 2x faster!"',
      icon: <Memory sx={{ fontSize: 50 }} />,
      color: '#e74c3c',
      exampleData: 'Causal chain: Highway route → 50% faster (uplift: 2.1x)',
      exampleDataEli5: 'Taking the highway made things 2x faster!'
    },
    {
      label: 'Skill Library Query',
      labelEli5: '🎯 Uses Its Best Tricks',
      description: 'Retrieves learned skills with high success rates',
      descriptionEli5: 'The robot picks its favorite tricks that work really well!',
      icon: <AutoAwesome sx={{ fontSize: 50 }} />,
      color: '#f39c12',
      exampleData: 'Applying skill: "rush_hour_optimization" (success rate: 94%)',
      exampleDataEli5: 'Uses its "avoid traffic" trick (works 94 times out of 100!)'
    },
    {
      label: 'Execute & Learn',
      labelEli5: '⚡ Takes Action!',
      description: 'Performs the action and records outcome for future learning',
      descriptionEli5: 'The robot does the task and remembers how it went!',
      icon: <Psychology sx={{ fontSize: 50 }} />,
      color: '#2ecc71',
      exampleData: 'Action executed: Route optimized, delivery time: 12 min',
      exampleDataEli5: 'Pizza delivered in just 12 minutes - awesome!'
    },
    {
      label: 'Reflexion & Improvement',
      labelEli5: '🤔 Gets Better for Next Time',
      description: 'Self-critique and update memory with new learnings',
      descriptionEli5: 'The robot thinks about what it can do better next time!',
      icon: <CheckCircle sx={{ fontSize: 50 }} />,
      color: '#1abc9c',
      exampleData: 'Learning stored: New skill variant with 2% better performance',
      exampleDataEli5: 'Learned a new trick that\'s even 2% better!'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, steps.length]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsAutoPlaying(false);
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsAutoPlaying(true);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          {getText(
            'Data Flow Through AgentDB',
            '🌊 How the Robot\'s Brain Works (Watch the Magic!)'
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {getText(
            'Follow the journey of a request through the agent system',
            'See how a question travels through the robot\'s brain step by step!'
          )}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={isAutoPlaying ? '▶️ Auto-playing' : '⏸️ Paused'}
            color={isAutoPlaying ? 'success' : 'default'}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          />
          <Chip
            label="🔄 Restart"
            color="primary"
            onClick={handleReset}
          />
        </Box>
      </Box>

      {/* Visual Flow Diagram */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 1,
          mb: 4,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '2px dashed',
          borderColor: 'primary.main'
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <AnimatedIcon
              active={activeStep === index}
              sx={{
                color: step.color,
                opacity: activeStep === index ? 1 : 0.3,
                transition: 'opacity 0.3s',
                cursor: 'pointer'
              }}
              onClick={() => handleStepClick(index)}
            >
              {step.icon}
            </AnimatedIcon>
            {index < steps.length - 1 && (
              <FlowArrow
                sx={{
                  opacity: activeStep === index ? 1 : 0.2,
                  transition: 'opacity 0.3s'
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Detailed Steps */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={index} expanded>
            <StepLabel
              onClick={() => handleStepClick(index)}
              sx={{ cursor: 'pointer' }}
              StepIconProps={{
                sx: {
                  color: `${step.color} !important`,
                  fontSize: 30
                }
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {mode === 'eli5' ? step.labelEli5 : step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {mode === 'eli5' ? step.descriptionEli5 : step.description}
              </Typography>
              {(step.exampleData || step.exampleDataEli5) && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    borderLeft: '4px solid',
                    borderColor: step.color,
                    fontFamily: 'monospace'
                  }}
                >
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    {getText('Example:', '📝 Example:')}
                  </Typography>
                  <Typography variant="body2">
                    {mode === 'eli5' ? step.exampleDataEli5 : step.exampleData}
                  </Typography>
                </Box>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Summary */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          bgcolor: 'success.dark',
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {getText(
            '⚡ Complete Cycle Time: Sub-millisecond to seconds',
            '⚡ This All Happens Super Fast - In Just Seconds!'
          )}
        </Typography>
        <Typography variant="body2">
          {getText(
            'The agent continuously learns and improves with each interaction, building a smarter knowledge base over time.',
            'Every time the robot helps, it gets a tiny bit smarter - like practicing math problems makes you better at math! 🧠✨'
          )}
        </Typography>
      </Box>
    </Paper>
  );
};
