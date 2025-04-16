
export enum ScenarioStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface ScenarioOptions {
  silent?: boolean;
  speed?: SpeedOption;
  autoCleanup?: boolean;
}

export type SpeedOption = 'slow' | 'normal' | 'fast' | 1 | 2 | 3;

export interface ScenarioActionResult {
  success: boolean;
  details?: string;
}

export interface ScenarioProgress {
  status: ScenarioStatus;
  currentAction?: string;
  completedActions: number;
  totalActions: number;
  isPaused: boolean;
  percentage: number;
}

export interface ScenarioResult {
  success: boolean;
  message?: string;
  error?: Error | string;
  actions?: ScenarioActionResult[];
  stats?: {
    duration: number;
    actionsCompleted: number;
    actionsTotal: number;
  };
}
