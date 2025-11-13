// src/components/CyberEnhancedDashboard.tsx
// Cyberpunk Terminal Redesign of Enhanced AgentDB Dashboard

import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Grid, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { useLanguageMode } from '../contexts/LanguageModeContext';
import '../styles/cyberpunk.css';

// Styled Components with Cyberpunk Aesthetic
const DashboardContainer = styled(Box)({
  padding: '24px',
  minHeight: '100vh',
  fontFamily: 'var(--font-body)',
  position: 'relative',
});

const TerminalWindow = styled(Box)({
  marginBottom: '24px',
  position: 'relative',
  transformStyle: 'preserve-3d',
});

const TerminalHeader = styled(Box)({
  background: 'linear-gradient(to right, var(--cyber-black-light), rgba(0, 247, 255, 0.1))',
  borderBottom: '1px solid var(--cyber-cyan)',
  padding: '8px 16px',
  fontFamily: 'var(--font-display)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.85rem',
  color: 'var(--cyber-text-dim)',
});

const TerminalDot = styled('span')<{ color: 'red' | 'yellow' | 'green' }>(({ color }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  display: 'inline-block',
  background: color === 'red' ? '#ff5f56' : color === 'yellow' ? '#ffbd2e' : '#27c93f',
  boxShadow: `0 0 5px ${color === 'red' ? '#ff5f56' : color === 'yellow' ? '#ffbd2e' : '#27c93f'}`,
}));

const TerminalContent = styled(Box)({
  background: 'rgba(21, 27, 61, 0.7)',
  border: '2px solid var(--cyber-cyan)',
  boxShadow: '0 0 20px rgba(0, 247, 255, 0.2), inset 0 0 40px rgba(0, 247, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  padding: '20px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30px',
    background: 'linear-gradient(to bottom, rgba(0, 247, 255, 0.1), transparent)',
    pointerEvents: 'none',
  },
});

const GlowText = styled(Typography)({
  fontFamily: 'var(--font-display)',
  color: 'var(--cyber-cyan)',
  textShadow: 'var(--glow-cyan)',
  textTransform: 'uppercase',
  letterSpacing: '3px',
  animation: 'textPulse 2s ease-in-out infinite',
});

const StatBadge = styled(Box)<{ variant?: 'cyan' | 'magenta' | 'lime' | 'yellow' }>(({ variant = 'cyan' }) => {
  const colors = {
    cyan: 'var(--cyber-cyan)',
    magenta: 'var(--cyber-magenta)',
    lime: 'var(--cyber-lime)',
    yellow: 'var(--cyber-yellow)',
  };
  const color = colors[variant];

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    margin: '4px',
    background: `${color}15`,
    border: `1px solid ${color}`,
    color: color,
    fontFamily: 'var(--font-display)',
    fontSize: '0.85rem',
    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s',
    '&:hover': {
      boxShadow: `0 0 10px ${color}80`,
      transform: 'translateY(-2px)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
      transition: 'left 0.5s',
    },
    '&:hover::before': {
      left: '100%',
    },
  };
});

const CyberButton = styled(Button)({
  background: 'transparent',
  border: '2px solid var(--cyber-cyan)',
  color: 'var(--cyber-cyan)',
  padding: '10px 20px',
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
    background: 'var(--cyber-cyan)',
    transition: 'left 0.3s',
    zIndex: -1,
  },
  '&:hover': {
    color: 'var(--cyber-black)',
    boxShadow: 'var(--glow-cyan)',
  },
  '&:hover::before': {
    left: 0,
  },
});

const CyberTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'var(--font-body)',
    color: 'var(--cyber-text)',
    background: 'rgba(10, 14, 39, 0.5)',
    '& fieldset': {
      borderColor: 'var(--cyber-cyan)',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: 'var(--cyber-cyan)',
      boxShadow: 'var(--glow-cyan)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--cyber-magenta)',
      boxShadow: 'var(--glow-magenta)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'var(--cyber-text-dim)',
    fontFamily: 'var(--font-body)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'var(--cyber-magenta)',
  },
});

const DataRow = styled(Box)({
  padding: '12px 0',
  borderBottom: '1px solid rgba(0, 247, 255, 0.2)',
  fontFamily: 'var(--font-body)',
  color: 'var(--cyber-text)',
  transition: 'all 0.3s',
  '&:hover': {
    background: 'rgba(0, 247, 255, 0.05)',
    borderLeft: '3px solid var(--cyber-cyan)',
    paddingLeft: '8px',
  },
});

const MatrixStreamContainer = styled(Box)({
  position: 'relative',
  maxHeight: '400px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'var(--cyber-black-light)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'var(--cyber-cyan)',
    boxShadow: 'var(--glow-cyan)',
  },
});

interface AgentAction {
  id: number;
  timestamp: string;
  actionType: string;
  description: string;
  success: boolean;
  reward: number;
  similarity?: number;
}

interface CausalRelation {
  from: string;
  to: string;
  uplift: number;
  confidence: number;
}

interface Skill {
  id: number;
  name: string;
  description: string;
  successRate: number;
  uses: number;
  avgReward: number;
}

interface EnhancedStats {
  totalActions: number;
  totalSkills: number;
  totalEpisodes: number;
  totalCausalEdges: number;
  vectorSearchEnabled: boolean;
  wasmEnabled: boolean;
}

const CyberEnhancedDashboard: React.FC<{ serverUrl?: string }> = ({
  serverUrl = 'http://localhost:3002',
}) => {
  const { mode, toggleMode, getText } = useLanguageMode();
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [causalRelations, setCausalRelations] = useState<CausalRelation[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AgentAction[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Optimized polling - reduced from 200ms to 2000ms (2 seconds)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/stats`);
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setError(null);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setError('Connection lost to AI core...');
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [serverUrl]);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/actions/recent?limit=10`);
        const data = await response.json();
        if (data.success) {
          setActions(data.actions);
          setError(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch actions:', error);
        setError('Neural network offline...');
        setLoading(false);
      }
    };

    fetchActions();
    const interval = setInterval(fetchActions, 2000);
    return () => clearInterval(interval);
  }, [serverUrl]);

  useEffect(() => {
    const fetchCausal = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/causal/relations?minConfidence=0.6`);
        const data = await response.json();
        if (data.success) {
          setCausalRelations(data.relations.slice(0, 5));
          setError(null);
        }
      } catch (error) {
        console.error('Failed to fetch causal relations:', error);
      }
    };

    fetchCausal();
    const interval = setInterval(fetchCausal, 2000);
    return () => clearInterval(interval);
  }, [serverUrl]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/skills`);
        const data = await response.json();
        if (data.success) {
          setSkills(data.skills);
          setError(null);
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      }
    };

    fetchSkills();
    const interval = setInterval(fetchSkills, 2000);
    return () => clearInterval(interval);
  }, [serverUrl]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`${serverUrl}/api/actions/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, k: 5, threshold: 0.5 }),
      });
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search protocol failed...');
    } finally {
      setSearching(false);
    }
  };

  // Typewriter effect for title
  useEffect(() => {
    if (!titleRef.current) return;
    const text = getText('AGENTDB // NEURAL CORE', '🤖 ROBOT BRAIN // ONLINE');
    const element = titleRef.current;
    let index = 0;

    element.textContent = '';

    const timer = setInterval(() => {
      if (index < text.length) {
        element.textContent += text[index];
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [mode, getText]);

  if (loading) {
    return (
      <DashboardContainer>
        <div className="cyber-background" />
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
          <div className="cyber-loading" />
          <GlowText variant="h5" sx={{ mt: 3 }}>
            {getText('INITIALIZING NEURAL CORE...', 'BOOTING UP ROBOT BRAIN...')}
          </GlowText>
        </Box>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <div className="cyber-background" />

      {/* Header Section */}
      <TerminalWindow className="cyber-slide-in-up">
        <TerminalHeader>
          <TerminalDot color="red" />
          <TerminalDot color="yellow" />
          <TerminalDot color="green" />
          <span style={{ marginLeft: '12px' }}>SYSTEM: AGENTDB_ENHANCED v2.0</span>
          <span style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={toggleMode}>
            [{mode === 'eli5' ? '👶 KID-MODE' : '🔧 TECH-MODE'}]
          </span>
        </TerminalHeader>
        <TerminalContent>
          <GlowText
            ref={titleRef}
            variant="h3"
            sx={{
              mb: 2,
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
            }}
          />
          <Typography
            variant="body1"
            sx={{
              color: 'var(--cyber-text-dim)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
            }}
          >
            {getText(
              '> Real-time monitoring of advanced AgentDB features',
              '> Watch the robot learn and make decisions in real-time! 🚀'
            )}
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                background: 'rgba(255, 0, 110, 0.1)',
                border: '1px solid var(--cyber-magenta)',
                color: 'var(--cyber-magenta)',
                fontFamily: 'var(--font-body)',
              }}
            >
              ⚠️ {error}
            </Alert>
          )}
        </TerminalContent>
      </TerminalWindow>

      {/* Statistics Grid */}
      <TerminalWindow className="cyber-slide-in-left">
        <TerminalHeader>
          <span>📊 SYSTEM_STATS.LOG</span>
        </TerminalHeader>
        <TerminalContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <StatBadge variant="cyan">
              <span>⚡</span>
              <span>{getText(`ACTIONS: ${stats?.totalActions || 0}`, `TASKS: ${stats?.totalActions || 0}`)}</span>
            </StatBadge>
            <StatBadge variant="magenta">
              <span>🎯</span>
              <span>{getText(`SKILLS: ${stats?.totalSkills || 0}`, `TRICKS: ${stats?.totalSkills || 0}`)}</span>
            </StatBadge>
            <StatBadge variant="lime">
              <span>📚</span>
              <span>{getText(`EPISODES: ${stats?.totalEpisodes || 0}`, `MEMORIES: ${stats?.totalEpisodes || 0}`)}</span>
            </StatBadge>
            <StatBadge variant="yellow">
              <span>🔗</span>
              <span>{getText(`CAUSAL: ${stats?.totalCausalEdges || 0}`, `CAUSES: ${stats?.totalCausalEdges || 0}`)}</span>
            </StatBadge>
            <StatBadge variant={stats?.vectorSearchEnabled ? 'lime' : 'cyan'}>
              <span>🔍</span>
              <span>{getText('VECTOR SEARCH', 'SUPER SEARCH')}: {stats?.vectorSearchEnabled ? 'ON' : 'OFF'}</span>
            </StatBadge>
            <StatBadge variant={stats?.wasmEnabled ? 'lime' : 'cyan'}>
              <span>⚡</span>
              <span>{getText('WASM', 'TURBO')}: {stats?.wasmEnabled ? 'ON' : 'OFF'}</span>
            </StatBadge>
          </Box>
        </TerminalContent>
      </TerminalWindow>

      <Grid container spacing={3}>
        {/* Vector Search */}
        <Grid item xs={12} lg={6}>
          <TerminalWindow className="cyber-slide-in-left" sx={{ animationDelay: '0.1s' }}>
            <TerminalHeader>
              <span>🔍 VECTOR_SEARCH.EXE</span>
            </TerminalHeader>
            <TerminalContent>
              <Typography variant="subtitle2" sx={{ color: 'var(--cyber-cyan)', mb: 2, fontFamily: 'var(--font-display)' }}>
                {getText('// Neural Embeddings (384-dim)', '// Find Similar Robot Actions')}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <CyberTextField
                  fullWidth
                  size="small"
                  placeholder={getText('Query neural network...', 'Ask what the robot did...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <CyberButton onClick={handleSearch} disabled={searching}>
                  {searching ? <CircularProgress size={20} sx={{ color: 'var(--cyber-cyan)' }} /> : '>'}
                </CyberButton>
              </Box>

              <MatrixStreamContainer>
                {searchResults.length > 0 ? (
                  searchResults.map((result, idx) => (
                    <DataRow key={idx}>
                      <Typography variant="caption" sx={{ color: 'var(--cyber-lime)', fontFamily: 'var(--font-display)' }}>
                        [{result.actionType}]
                      </Typography>
                      <Typography variant="body2" sx={{ my: 0.5 }}>
                        {result.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--cyber-text-dim)' }}>
                        similarity: {((result.similarity || 0) * 100).toFixed(1)}%
                      </Typography>
                    </DataRow>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'var(--cyber-text-dim)', textAlign: 'center', py: 4 }}>
                    {searchQuery ? '// No matches found //' : '// Awaiting query //'}
                  </Typography>
                )}
              </MatrixStreamContainer>
            </TerminalContent>
          </TerminalWindow>
        </Grid>

        {/* Causal Memory */}
        <Grid item xs={12} lg={6}>
          <TerminalWindow className="cyber-slide-in-right" sx={{ animationDelay: '0.2s' }}>
            <TerminalHeader>
              <span>🧠 CAUSAL_MEMORY.DAT</span>
            </TerminalHeader>
            <TerminalContent>
              <Typography variant="subtitle2" sx={{ color: 'var(--cyber-magenta)', mb: 2, fontFamily: 'var(--font-display)' }}>
                {getText('// Intervention-Based Reasoning', '// When X happens, Y follows!')}
              </Typography>

              <MatrixStreamContainer>
                {causalRelations.length > 0 ? (
                  <table className="cyber-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>CAUSE → EFFECT</th>
                        <th style={{ textAlign: 'right' }}>UPLIFT</th>
                        <th style={{ textAlign: 'right' }}>CONF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {causalRelations.map((rel, idx) => (
                        <tr key={idx}>
                          <td>
                            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'var(--font-body)' }}>
                              {rel.from.substring(0, 25)}... →<br />
                              {rel.to.substring(0, 25)}...
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <StatBadge variant={rel.uplift > 0 ? 'lime' : 'magenta'} sx={{ margin: 0 }}>
                              {rel.uplift.toFixed(2)}
                            </StatBadge>
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--cyber-text)' }}>
                            {(rel.confidence * 100).toFixed(0)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Typography variant="body2" sx={{ color: 'var(--cyber-text-dim)', textAlign: 'center', py: 4 }}>
                    // Building causal graph... //
                  </Typography>
                )}
              </MatrixStreamContainer>
            </TerminalContent>
          </TerminalWindow>
        </Grid>

        {/* Skills Library */}
        <Grid item xs={12} lg={6}>
          <TerminalWindow className="cyber-slide-in-left" sx={{ animationDelay: '0.3s' }}>
            <TerminalHeader>
              <span>🎯 SKILL_LIBRARY.DB</span>
            </TerminalHeader>
            <TerminalContent>
              <Typography variant="subtitle2" sx={{ color: 'var(--cyber-lime)', mb: 2, fontFamily: 'var(--font-display)' }}>
                {getText('// Learned Capabilities', '// All The Cool Tricks!')}
              </Typography>

              <MatrixStreamContainer>
                {skills.length > 0 ? (
                  <table className="cyber-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>SKILL</th>
                        <th style={{ textAlign: 'right' }}>SUCCESS</th>
                        <th style={{ textAlign: 'right' }}>REWARD</th>
                        <th style={{ textAlign: 'right' }}>USES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.map((skill) => (
                        <tr key={skill.id}>
                          <td>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--cyber-cyan)' }}>
                              {skill.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--cyber-text-dim)' }}>
                              {skill.description}
                            </Typography>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <StatBadge variant={skill.successRate > 0.8 ? 'lime' : 'yellow'} sx={{ margin: 0 }}>
                              {(skill.successRate * 100).toFixed(0)}%
                            </StatBadge>
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--cyber-text)' }}>
                            {skill.avgReward.toFixed(1)}
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--cyber-text)' }}>
                            {skill.uses}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Typography variant="body2" sx={{ color: 'var(--cyber-text-dim)', textAlign: 'center', py: 4 }}>
                    // No skills acquired //
                  </Typography>
                )}
              </MatrixStreamContainer>
            </TerminalContent>
          </TerminalWindow>
        </Grid>

        {/* Recent Actions - Matrix Stream */}
        <Grid item xs={12} lg={6}>
          <TerminalWindow className="cyber-slide-in-right" sx={{ animationDelay: '0.4s' }}>
            <TerminalHeader>
              <span>🎬 ACTION_STREAM.LOG</span>
              <span style={{ marginLeft: 'auto', color: 'var(--cyber-lime)' }}>● LIVE</span>
            </TerminalHeader>
            <TerminalContent>
              <Typography variant="subtitle2" sx={{ color: 'var(--cyber-yellow)', mb: 2, fontFamily: 'var(--font-display)' }}>
                {getText('// Real-Time Activity Feed', '// What\'s Happening Right Now!')}
              </Typography>

              <MatrixStreamContainer>
                {actions.map((action, idx) => (
                  <DataRow key={action.id} sx={{ animationDelay: `${idx * 0.05}s` }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <StatBadge variant="cyan" sx={{ margin: 0, fontSize: '0.7rem', padding: '2px 8px' }}>
                        {action.actionType}
                      </StatBadge>
                      <StatBadge
                        variant={action.success ? 'lime' : 'magenta'}
                        sx={{ margin: 0, fontSize: '0.7rem', padding: '2px 8px' }}
                      >
                        {action.success ? '✓ OK' : '✗ FAIL'}
                      </StatBadge>
                    </Box>
                    <Typography variant="body2" sx={{ my: 0.5 }}>
                      {action.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--cyber-text-dim)' }}>
                      reward: {action.reward.toFixed(2)} | {new Date(action.timestamp).toLocaleTimeString()}
                    </Typography>
                  </DataRow>
                ))}
              </MatrixStreamContainer>
            </TerminalContent>
          </TerminalWindow>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <div className="cyber-divider" />
        <Typography variant="caption" sx={{ color: 'var(--cyber-text-dim)', fontFamily: 'var(--font-display)' }}>
          {getText(
            '// AGENTDB v2.0 // NEURAL CORE ONLINE // ALL SYSTEMS OPERATIONAL //',
            '// ROBOT BRAIN v2.0 // POWERED BY AI // LEARNING IN PROGRESS //'
          )}
        </Typography>
      </Box>
    </DashboardContainer>
  );
};

export default CyberEnhancedDashboard;
