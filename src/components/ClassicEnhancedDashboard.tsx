// src/components/ClassicEnhancedDashboard.tsx
// Classic Editorial Redesign of Enhanced AgentDB Dashboard

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Grid, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TimelineIcon from '@mui/icons-material/Timeline';
import SchoolIcon from '@mui/icons-material/School';
import HistoryIcon from '@mui/icons-material/History';
import { useLanguageMode } from '../contexts/LanguageModeContext';
import '../styles/classic.css';

// Styled Components with Classic Aesthetic
const DashboardContainer = styled(Box)({
  maxWidth: '1400px',
  margin: '0 auto',
  padding: 'var(--spacing-lg)',
  fontFamily: 'var(--font-body)',
});

const Masthead = styled(Box)({
  textAlign: 'center',
  padding: 'var(--spacing-xxl) var(--spacing-lg)',
  borderTop: '3px solid var(--classic-charcoal)',
  borderBottom: '3px solid var(--classic-charcoal)',
  background: 'var(--classic-paper)',
  marginBottom: 'var(--spacing-xl)',
  boxShadow: 'var(--shadow-md)',
});

const MastheadTitle = styled(Typography)({
  fontFamily: 'var(--font-headline)',
  fontSize: '3rem',
  fontWeight: 900,
  color: 'var(--classic-charcoal)',
  margin: 0,
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
  '@media (max-width: 768px)': {
    fontSize: '2rem',
  },
});

const MastheadSubtitle = styled(Typography)({
  fontFamily: 'var(--font-body)',
  fontSize: '1.125rem',
  fontStyle: 'italic',
  color: 'var(--classic-gray)',
  marginTop: 'var(--spacing-sm)',
});

const MastheadDate = styled(Typography)({
  fontFamily: 'var(--font-sans)',
  fontSize: '0.875rem',
  color: 'var(--classic-gray)',
  marginTop: 'var(--spacing-md)',
});

const ClassicCard = styled(Box)({
  background: 'var(--classic-paper)',
  border: '1px solid var(--classic-light-gray)',
  boxShadow: 'var(--shadow-md)',
  padding: 'var(--spacing-lg)',
  marginBottom: 'var(--spacing-lg)',
  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
  '&:hover': {
    boxShadow: 'var(--shadow-lg)',
    transform: 'translateY(-2px)',
  },
});

const CardHeader = styled(Box)({
  borderBottom: '2px solid var(--classic-charcoal)',
  paddingBottom: 'var(--spacing-md)',
  marginBottom: 'var(--spacing-lg)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
});

const CardTitle = styled(Typography)({
  fontFamily: 'var(--font-headline)',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'var(--classic-charcoal)',
  margin: 0,
});

const CardSubtitle = styled(Typography)({
  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  fontStyle: 'italic',
  color: 'var(--classic-gray)',
  marginTop: 'var(--spacing-xs)',
});

const StatGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 'var(--spacing-lg)',
  margin: 'var(--spacing-lg) 0',
});

const StatBox = styled(Box)({
  textAlign: 'center',
  padding: 'var(--spacing-lg)',
  background: 'var(--classic-paper)',
  border: '1px solid var(--classic-light-gray)',
  boxShadow: 'var(--shadow-sm)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
});

const StatValue = styled(Typography)({
  fontFamily: 'var(--font-headline)',
  fontSize: '2.5rem',
  fontWeight: 700,
  color: 'var(--classic-burgundy)',
  lineHeight: 1,
  marginBottom: 'var(--spacing-sm)',
});

const StatLabel = styled(Typography)({
  fontFamily: 'var(--font-sans)',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--classic-gray)',
});

const ClassicInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'var(--font-body)',
    background: 'var(--classic-paper)',
    '& fieldset': {
      borderColor: 'var(--classic-light-gray)',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: 'var(--classic-charcoal)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--classic-navy)',
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'var(--font-body)',
    color: 'var(--classic-gray)',
  },
});

const ClassicButton = styled(Button)({
  padding: 'var(--spacing-md) var(--spacing-xl)',
  background: 'var(--classic-charcoal)',
  color: 'var(--classic-paper)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  boxShadow: 'var(--shadow-sm)',
  '&:hover': {
    background: 'var(--classic-navy)',
    boxShadow: 'var(--shadow-md)',
    transform: 'translateY(-1px)',
  },
});

const DataRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: 'var(--spacing-md) 0',
  borderBottom: '1px solid var(--classic-light-gray)',
  transition: 'padding-left 0.2s ease',
  '&:hover': {
    paddingLeft: 'var(--spacing-sm)',
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
  },
  '&:last-child': {
    borderBottom: 'none',
  },
});

const ScrollContainer = styled(Box)({
  maxHeight: '400px',
  overflowY: 'auto',
  paddingRight: 'var(--spacing-sm)',
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

const ClassicEnhancedDashboard: React.FC<{ serverUrl?: string }> = ({
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
  const [currentDate] = useState(new Date());

  // Optimized polling - 2 seconds
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
        setError('Unable to connect to server');
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
        setError('Unable to fetch recent actions');
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
      setError('Search operation failed');
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div className="classic-background" />
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
          <div className="classic-loading" />
          <Typography variant="h6" sx={{ mt: 3, fontFamily: 'var(--font-headline)', color: 'var(--classic-charcoal)' }}>
            {getText('Loading AgentDB Dashboard...', 'Loading Robot Brain Dashboard...')}
          </Typography>
        </Box>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <div className="classic-background" />

      {/* Newspaper-style Masthead */}
      <Masthead className="classic-fade-in">
        <MastheadTitle>
          {getText('AGENTDB INTELLIGENCE REPORT', '🤖 THE ROBOT BRAIN TIMES')}
        </MastheadTitle>
        <MastheadSubtitle>
          {getText(
            'Advanced Artificial Intelligence Monitoring & Analytics',
            'Where Smart Robots Share Their Amazing Adventures!'
          )}
        </MastheadSubtitle>
        <MastheadDate>
          {currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </MastheadDate>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              color: 'var(--classic-gray)',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={toggleMode}
          >
            {mode === 'eli5' ? '📖 Kid-Friendly Edition' : '⚙️ Technical Edition'}
          </Typography>
        </Box>
      </Masthead>

      {error && (
        <Alert
          severity="error"
          className="classic-alert"
          sx={{
            mb: 3,
            fontFamily: 'var(--font-body)',
            borderLeft: '4px solid var(--classic-burgundy)'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Statistics Section */}
      <ClassicCard className="classic-fade-in">
        <CardHeader>
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-headline)', fontWeight: 700 }}>
            {getText('System Metrics', '📊 Brain Power Stats')}
          </Typography>
        </CardHeader>

        <StatGrid>
          <StatBox>
            <StatValue>{stats?.totalActions || 0}</StatValue>
            <StatLabel>{getText('Total Actions', 'Things Done')}</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>{stats?.totalSkills || 0}</StatValue>
            <StatLabel>{getText('Skills Learned', 'Tricks Mastered')}</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>{stats?.totalEpisodes || 0}</StatValue>
            <StatLabel>{getText('Episodes', 'Memories')}</StatLabel>
          </StatBox>
          <StatBox>
            <StatValue>{stats?.totalCausalEdges || 0}</StatValue>
            <StatLabel>{getText('Causal Links', 'Cause & Effect')}</StatLabel>
          </StatBox>
        </StatGrid>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2, justifyContent: 'center' }}>
          <span className={`classic-badge ${stats?.vectorSearchEnabled ? 'classic-badge-forest' : 'classic-badge-burgundy'}`}>
            {getText('Vector Search', 'Smart Search')}: {stats?.vectorSearchEnabled ? 'Active' : 'Inactive'}
          </span>
          <span className={`classic-badge ${stats?.wasmEnabled ? 'classic-badge-forest' : 'classic-badge-burgundy'}`}>
            {getText('WASM Acceleration', 'Turbo Mode')}: {stats?.wasmEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </Box>
      </ClassicCard>

      <Grid container spacing={3}>
        {/* Vector Search Section */}
        <Grid item xs={12} lg={6}>
          <ClassicCard className="classic-fade-in">
            <CardHeader>
              <SearchIcon sx={{ color: 'var(--classic-burgundy)', fontSize: '1.75rem' }} />
              <Box>
                <CardTitle>{getText('Semantic Vector Search', '🔍 Smart Search Engine')}</CardTitle>
                <CardSubtitle>
                  {getText('Neural embeddings in 384 dimensions', 'Find similar robot memories!')}
                </CardSubtitle>
              </Box>
            </CardHeader>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <ClassicInput
                fullWidth
                size="small"
                placeholder={getText('Enter search query...', 'Ask about robot activities...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <ClassicButton onClick={handleSearch} disabled={searching}>
                {searching ? <CircularProgress size={20} sx={{ color: 'var(--classic-paper)' }} /> : 'Search'}
              </ClassicButton>
            </Box>

            <ScrollContainer>
              {searchResults.length > 0 ? (
                searchResults.map((result, idx) => (
                  <DataRow key={idx}>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        className="classic-label"
                        sx={{ mb: 0.5, color: 'var(--classic-burgundy)' }}
                      >
                        {result.actionType}
                      </Typography>
                      <Typography sx={{ fontFamily: 'var(--font-body)', mb: 0.5 }}>
                        {result.description}
                      </Typography>
                      <Typography className="classic-caption">
                        Similarity: {((result.similarity || 0) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </DataRow>
                ))
              ) : (
                <Typography
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontStyle: 'italic',
                    color: 'var(--classic-gray)',
                    textAlign: 'center',
                    py: 4
                  }}
                >
                  {searchQuery ? 'No matching results found.' : 'Enter a query to search agent actions.'}
                </Typography>
              )}
            </ScrollContainer>
          </ClassicCard>
        </Grid>

        {/* Causal Memory Section */}
        <Grid item xs={12} lg={6}>
          <ClassicCard className="classic-fade-in">
            <CardHeader>
              <TimelineIcon sx={{ color: 'var(--classic-navy)', fontSize: '1.75rem' }} />
              <Box>
                <CardTitle>{getText('Causal Memory Graph', '🧠 Cause & Effect Memory')}</CardTitle>
                <CardSubtitle>
                  {getText('Intervention-based reasoning', 'When this happens, that follows!')}
                </CardSubtitle>
              </Box>
            </CardHeader>

            <ScrollContainer>
              {causalRelations.length > 0 ? (
                <table className="classic-table">
                  <thead>
                    <tr>
                      <th>Causal Relationship</th>
                      <th style={{ textAlign: 'right' }}>Uplift</th>
                      <th style={{ textAlign: 'right' }}>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {causalRelations.map((rel, idx) => (
                      <tr key={idx}>
                        <td>
                          <Typography variant="body2" sx={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
                            {rel.from.substring(0, 30)}... →<br />
                            {rel.to.substring(0, 30)}...
                          </Typography>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`classic-badge ${rel.uplift > 0 ? 'classic-badge-forest' : 'classic-badge-burgundy'}`}>
                            {rel.uplift.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                            {(rel.confidence * 100).toFixed(0)}%
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontStyle: 'italic',
                    color: 'var(--classic-gray)',
                    textAlign: 'center',
                    py: 4
                  }}
                >
                  Analyzing causal relationships...
                </Typography>
              )}
            </ScrollContainer>
          </ClassicCard>
        </Grid>

        {/* Skills Library Section */}
        <Grid item xs={12} lg={6}>
          <ClassicCard className="classic-fade-in">
            <CardHeader>
              <SchoolIcon sx={{ color: 'var(--classic-gold)', fontSize: '1.75rem' }} />
              <Box>
                <CardTitle>{getText('Skill Library', '🎯 Learned Abilities')}</CardTitle>
                <CardSubtitle>
                  {getText('Capabilities learned from experience', 'All the cool tricks learned!')}
                </CardSubtitle>
              </Box>
            </CardHeader>

            <ScrollContainer>
              {skills.length > 0 ? (
                <table className="classic-table">
                  <thead>
                    <tr>
                      <th>Skill Name</th>
                      <th style={{ textAlign: 'right' }}>Success Rate</th>
                      <th style={{ textAlign: 'right' }}>Avg. Reward</th>
                      <th style={{ textAlign: 'right' }}>Uses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((skill) => (
                      <tr key={skill.id}>
                        <td>
                          <Typography variant="body2" sx={{ fontFamily: 'var(--font-headline)', fontWeight: 600 }}>
                            {skill.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--classic-gray)', fontFamily: 'var(--font-body)' }}>
                            {skill.description}
                          </Typography>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`classic-badge ${skill.successRate > 0.8 ? 'classic-badge-forest' : 'classic-badge-gold'}`}>
                            {(skill.successRate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                            {skill.avgReward.toFixed(1)}
                          </Typography>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Typography sx={{ fontFamily: 'var(--font-body)' }}>
                            {skill.uses}
                          </Typography>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontStyle: 'italic',
                    color: 'var(--classic-gray)',
                    textAlign: 'center',
                    py: 4
                  }}
                >
                  No skills acquired yet.
                </Typography>
              )}
            </ScrollContainer>
          </ClassicCard>
        </Grid>

        {/* Recent Actions Section */}
        <Grid item xs={12} lg={6}>
          <ClassicCard className="classic-fade-in">
            <CardHeader>
              <HistoryIcon sx={{ color: 'var(--classic-forest)', fontSize: '1.75rem' }} />
              <Box>
                <CardTitle>{getText('Recent Agent Actions', '🎬 Latest Activities')}</CardTitle>
                <CardSubtitle>
                  {getText('Real-time activity stream', 'What the robot is doing right now!')}
                </CardSubtitle>
              </Box>
            </CardHeader>

            <ScrollContainer>
              {actions.map((action) => (
                <DataRow key={action.id}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <span className="classic-badge classic-badge-navy">
                        {action.actionType}
                      </span>
                      <span className={`classic-badge ${action.success ? 'classic-badge-forest' : 'classic-badge-burgundy'}`}>
                        {action.success ? '✓ Success' : '✗ Failed'}
                      </span>
                    </Box>
                    <Typography sx={{ fontFamily: 'var(--font-body)', mb: 0.5 }}>
                      {action.description}
                    </Typography>
                    <Typography className="classic-caption">
                      Reward: {action.reward.toFixed(2)} | {new Date(action.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </DataRow>
              ))}
            </ScrollContainer>
          </ClassicCard>
        </Grid>
      </Grid>

      {/* Footer */}
      <Box sx={{ mt: 4, pt: 3, borderTop: '3px solid var(--classic-charcoal)', textAlign: 'center' }}>
        <hr className="classic-divider-ornamental" style={{ width: '200px', margin: '0 auto var(--spacing-lg)' }} />
        <Typography className="classic-caption">
          {getText(
            'AgentDB Intelligence Report • Advanced AI Monitoring & Analytics • All Rights Reserved',
            'The Robot Brain Times • Where Smart Robots Share Their Stories • Published with ❤️'
          )}
        </Typography>
      </Box>
    </DashboardContainer>
  );
};

export default ClassicEnhancedDashboard;
