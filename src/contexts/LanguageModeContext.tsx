import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LanguageMode = 'technical' | 'eli5';

interface LanguageModeContextType {
  mode: LanguageMode;
  toggleMode: () => void;
  setMode: (mode: LanguageMode) => void;
  getText: (technical: string, eli5: string) => string;
}

const LanguageModeContext = createContext<LanguageModeContextType | undefined>(undefined);

export const LanguageModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<LanguageMode>('eli5'); // Default to kid-friendly

  const toggleMode = () => {
    setMode(prev => prev === 'technical' ? 'eli5' : 'technical');
  };

  const getText = (technical: string, eli5: string) => {
    return mode === 'technical' ? technical : eli5;
  };

  return (
    <LanguageModeContext.Provider value={{ mode, toggleMode, setMode, getText }}>
      {children}
    </LanguageModeContext.Provider>
  );
};

export const useLanguageMode = () => {
  const context = useContext(LanguageModeContext);
  if (!context) {
    throw new Error('useLanguageMode must be used within a LanguageModeProvider');
  }
  return context;
};

// Dictionary of common terms with their ELI5 explanations
export const terminology = {
  agentDB: {
    technical: 'AgentDB - Advanced database engine for AI agents',
    eli5: '🤖 AgentDB - The Robot\'s Super Brain!'
  },
  vectorSearch: {
    technical: 'Vector Search - Semantic similarity matching using embeddings',
    eli5: '🔍 Super Search - Finding similar things like finding toys in a messy room!'
  },
  causalMemory: {
    technical: 'Causal Memory - Tracking cause-and-effect relationships with uplift metrics',
    eli5: '🧠 Cause & Effect Brain - Remembering "when I do X, Y happens" (like touching a hot stove = ouch!)'
  },
  skillLibrary: {
    technical: 'Skill Library - Learned skills with success rate tracking',
    eli5: '🎯 Skill Collection - All the tricks the robot learned (like riding a bike or tying shoes!)'
  },
  reflexion: {
    technical: 'Reflexion Memory - Self-critique and learning from failures',
    eli5: '🤔 Learning from Mistakes - Getting better by studying what went wrong (like fixing wrong answers on a test!)'
  },
  embeddings: {
    technical: '384-dimensional vector embeddings',
    eli5: 'A special way to remember what things are like'
  },
  semanticSearch: {
    technical: 'Semantic search with similarity scoring',
    eli5: 'Finding things that are similar or related'
  },
  uplift: {
    technical: 'Uplift metric indicating performance improvement',
    eli5: 'How much better things got (like going from a C to an A+!)'
  },
  confidence: {
    technical: 'Confidence score (0.0-1.0)',
    eli5: 'How sure the robot is (like being 90% sure it\'s going to rain)'
  },
  successRate: {
    technical: 'Success rate percentage',
    eli5: 'How many times it worked out of 100 tries'
  },
  episode: {
    technical: 'Episode - Recorded memory instance',
    eli5: 'A memory or story the robot remembers'
  },
  latency: {
    technical: 'Response latency (ms)',
    eli5: 'How fast it thinks (in milliseconds!)'
  },
  realtime: {
    technical: 'Real-time WebSocket updates',
    eli5: 'Updates happening right now, super fast!'
  }
};
