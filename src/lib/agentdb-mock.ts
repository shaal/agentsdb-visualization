// Mock AgentDB Client Library
// This is a mock implementation since @agentdb/client doesn't exist

export class AgentDBError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AgentDBError';
  }
}

export interface AgentDBConfig {
  host?: string;
  port?: number;
  projectId?: string;
  apiKey?: string;
}

export interface LiveQuery<T> {
  onUpdate: (callback: (data: T) => void) => () => void;
  onError: (callback: (error: AgentDBError) => void) => () => void;
  get: () => Promise<T>;
}

export class AgentDB {
  protected config: AgentDBConfig;

  constructor(config: AgentDBConfig) {
    this.config = config;
  }

  liveQuery<T>(_path: string): LiveQuery<T> {
    throw new Error('Method not implemented. Override in subclass.');
  }
}
