import type { AgentStatus, OrgStatus, TaskStatus, PipelineRunStatus } from './constants.js';

export interface AgentPermissions {
  canCreateAgents: boolean;
  canCreateTasks: boolean;
  canApproveHires: boolean;
  canModifyBudgets: boolean;
}

export interface HeartbeatPolicy {
  enabled: boolean;
  interval_sec: number;
  wake_on_demand: boolean;
  max_concurrent_runs: number;
}

export type ContextMode = 'thin' | 'fat';
export type AdapterType = 'claude-code-sdk' | 'http' | 'process';
export type PrincipalType = 'user' | 'agent';
export type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer';
export type ApprovalType = 'hire_agent' | 'budget_change' | 'deploy' | 'custom';
export type DocType = 'spec' | 'prd' | 'architecture' | 'guide' | 'other';
export type GoalLevel = 'outcome' | 'objective' | 'task';
export type TaskPriority = 'low' | 'medium' | 'high';
