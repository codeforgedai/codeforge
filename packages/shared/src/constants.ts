export const AgentStatus = {
  PENDING_APPROVAL: 'pending_approval',
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  ERROR: 'error',
  TERMINATED: 'terminated',
  RETIRED: 'retired',
} as const;
export type AgentStatus = (typeof AgentStatus)[keyof typeof AgentStatus];

export const OrgStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
} as const;
export type OrgStatus = (typeof OrgStatus)[keyof typeof OrgStatus];

export const TaskStatus = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  BLOCKED: 'blocked',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const PipelineRunStatus = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  LOOP_EXHAUSTED: 'loop_exhausted',
  BUDGET_EXCEEDED: 'budget_exceeded',
} as const;
export type PipelineRunStatus = (typeof PipelineRunStatus)[keyof typeof PipelineRunStatus];

export const HeartbeatRunStatus = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  TIMED_OUT: 'timed_out',
} as const;
export type HeartbeatRunStatus = (typeof HeartbeatRunStatus)[keyof typeof HeartbeatRunStatus];

export const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;
export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

export const WakeupSource = {
  TIMER: 'timer',
  ASSIGNMENT: 'assignment',
  ON_DEMAND: 'on_demand',
  AUTOMATION: 'automation',
} as const;
export type WakeupSource = (typeof WakeupSource)[keyof typeof WakeupSource];

export const agentStatusTransitions: Record<string, string[]> = {
  pending_approval: ['idle'],
  idle: ['running', 'paused', 'terminated', 'retired'],
  running: ['idle', 'error'],
  error: ['idle'],
  paused: ['idle'],
  // terminated and retired are final
};
