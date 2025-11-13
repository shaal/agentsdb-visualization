// src/components/EnhancedDashboard.tsx
// Dashboard showcasing AgentDB's advanced features

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MemoryIcon from '@mui/icons-material/Memory';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { useLanguageMode } from '../contexts/LanguageModeContext';
import { BeforeAfterComparison } from './BeforeAfterComparison';
import { DataFlowVisualizer } from './DataFlowVisualizer';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  backgroundColor: theme.palette.background.paper,
}));

const StatChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 600,
}));

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

const EnhancedDashboard: React.FC<{ serverUrl?: string }> = ({
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

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/stats`);
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 200);
    return () => clearInterval(interval);
  }, [serverUrl]);

  // Fetch recent actions
  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/actions/recent?limit=10`);
        const data = await response.json();
        if (data.success) {
          setActions(data.actions);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch actions:', error);
        setLoading(false);
      }
    };

    fetchActions();
    const interval = setInterval(fetchActions, 200);
    return () => clearInterval(interval);
  }, [serverUrl]);

  // Fetch causal relations
  useEffect(() => {
    const fetchCausal = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/causal/relations?minConfidence=0.6`);
        const data = await response.json();
        if (data.success) {
          setCausalRelations(data.relations.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch causal relations:', error);
      }
    };

    fetchCausal();
    const interval = setInterval(fetchCausal, 200);
    return () => clearInterval(interval);
  }, [serverUrl]);

  // Fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/skills`);
        const data = await response.json();
        if (data.success) {
          setSkills(data.skills);
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      }
    };

    fetchSkills();
    const interval = setInterval(fetchSkills, 200);
    return () => clearInterval(interval);
  }, [serverUrl]);

  // Handle semantic search
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
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {getText('Loading Enhanced AgentDB Dashboard...', '🤖 Loading the Robot Brain Dashboard...')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            {getText('Enhanced AgentDB Dashboard', '🤖 Robot Super Brain Dashboard')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {getText(
              'Real-time monitoring of advanced AgentDB features',
              'Watch how the robot learns and gets smarter in real-time! 🚀'
            )}
          </Typography>
        </Box>
        <Tooltip title={mode === 'eli5' ? 'Switch to Technical Mode' : 'Switch to Kid-Friendly Mode'}>
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'eli5'}
                onChange={toggleMode}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {mode === 'eli5' ? (
                  <>
                    <ChildFriendlyIcon />
                    <Typography variant="body2">Kid-Friendly</Typography>
                  </>
                ) : (
                  <>
                    <EngineeringIcon />
                    <Typography variant="body2">Technical</Typography>
                  </>
                )}
              </Box>
            }
          />
        </Tooltip>
      </Box>

      {/* Add new educational components */}
      <BeforeAfterComparison />
      <DataFlowVisualizer />

      {/* Statistics Overview */}
      <Box sx={{ my: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {getText('System Statistics', '📊 Robot Brain Stats')}
          </Typography>
          <Box>
            <StatChip
              label={getText(
                `Actions: ${stats?.totalActions || 0}`,
                `🎬 Things Done: ${stats?.totalActions || 0}`
              )}
              color="primary"
            />
            <StatChip
              label={getText(
                `Skills: ${stats?.totalSkills || 0}`,
                `🎯 Tricks Learned: ${stats?.totalSkills || 0}`
              )}
              color="secondary"
            />
            <StatChip
              label={getText(
                `Episodes: ${stats?.totalEpisodes || 0}`,
                `📚 Memories: ${stats?.totalEpisodes || 0}`
              )}
              color="info"
            />
            <StatChip
              label={getText(
                `Causal Edges: ${stats?.totalCausalEdges || 0}`,
                `🔗 Cause & Effect: ${stats?.totalCausalEdges || 0}`
              )}
              color="success"
            />
            <StatChip
              label={getText(
                `Vector Search: ${stats?.vectorSearchEnabled ? 'ON' : 'OFF'}`,
                `🔍 Super Search: ${stats?.vectorSearchEnabled ? 'ON' : 'OFF'}`
              )}
              color={stats?.vectorSearchEnabled ? 'success' : 'default'}
            />
            <StatChip
              label={getText(
                `WASM: ${stats?.wasmEnabled ? 'ON' : 'OFF'}`,
                `⚡ Turbo Mode: ${stats?.wasmEnabled ? 'ON' : 'OFF'}`
              )}
              color={stats?.wasmEnabled ? 'success' : 'default'}
            />
          </Box>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {/* Vector Search */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              avatar={<SearchIcon color="primary" />}
              title={getText('Vector Search & Embeddings', '🔍 Super Search')}
              subheader={getText(
                'Semantic search using neural embeddings',
                'Find similar things the robot did before!'
              )}
            />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={getText(
                    'Search actions semantically...',
                    'Ask about what the robot did...'
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={searching}
                >
                  {searching ? <CircularProgress size={24} /> : getText('Search', 'Find')}
                </Button>
              </Box>

              {searchResults.length > 0 && (
                <List dense>
                  {searchResults.map((result, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem>
                        <ListItemText
                          primary={result.description}
                          secondary={`Similarity: ${(result.similarity! * 100).toFixed(1)}% | ${result.actionType}`}
                        />
                      </ListItem>
                      {idx < searchResults.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}

              {searchResults.length === 0 && searchQuery && !searching && (
                <Alert severity="info">No results found. Try a different query.</Alert>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Causal Memory */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              avatar={<TimelineIcon color="secondary" />}
              title={getText('Causal Memory Graph', '🧠 Cause & Effect Brain')}
              subheader={getText(
                'Intervention-based reasoning',
                'Robot remembers: when I do X, Y happens!'
              )}
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>From → To</TableCell>
                      <TableCell align="right">Uplift</TableCell>
                      <TableCell align="right">Confidence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {causalRelations.map((rel, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography variant="caption" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                            {rel.from.substring(0, 30)}... → {rel.to.substring(0, 30)}...
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={rel.uplift.toFixed(2)}
                            color={rel.uplift > 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {(rel.confidence * 100).toFixed(0)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {causalRelations.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Building causal relationships...
                </Alert>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Skills Library */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              avatar={<SchoolIcon color="info" />}
              title={getText('Skill Library', '🎯 Trick Collection')}
              subheader={getText(
                'Learned skills from episodes',
                'All the tricks the robot learned!'
              )}
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Skill</TableCell>
                      <TableCell align="right">Success Rate</TableCell>
                      <TableCell align="right">Avg Reward</TableCell>
                      <TableCell align="right">Uses</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {skill.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {skill.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${(skill.successRate * 100).toFixed(0)}%`}
                            color={skill.successRate > 0.8 ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{skill.avgReward.toFixed(1)}</TableCell>
                        <TableCell align="right">{skill.uses}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Recent Actions */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardHeader
              avatar={<MemoryIcon color="warning" />}
              title={getText('Recent Agent Actions', '🎬 What the Robot Just Did')}
              subheader={getText(
                'Live activity stream',
                'Watch the robot working in real-time!'
              )}
            />
            <CardContent>
              <List dense>
                {actions.map((action, idx) => (
                  <React.Fragment key={action.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={action.actionType}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={action.success ? 'Success' : 'Failed'}
                              size="small"
                              color={action.success ? 'success' : 'error'}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            {action.description}
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              Reward: {action.reward.toFixed(2)} | {new Date(action.timestamp).toLocaleTimeString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {idx < actions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnhancedDashboard;
