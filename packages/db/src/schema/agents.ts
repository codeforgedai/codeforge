import { pgTable, text, timestamp, jsonb, integer, bigint, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { createId } from '../utils.js';
import { organizations } from './tenancy.js';

export const agents = pgTable('agents', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  shortname: text('shortname').notNull(),
  role: text('role').notNull(),
  status: text('status').notNull().default('pending_approval'),
  reportsTo: text('reports_to'),
  adapterType: text('adapter_type').notNull().default('claude-agent-sdk'),
  adapterConfig: jsonb('adapter_config').default({}),
  runtimeConfig: jsonb('runtime_config').default({}),
  instructions: text('instructions'),
  model: text('model').notNull().default('claude-sonnet-4-5'),
  tools: jsonb('tools').default([]),
  contextMode: text('context_mode').notNull().default('thin'),
  budgetMonthlyCents: integer('budget_monthly_cents').default(0),
  spentMonthlyCents: integer('spent_monthly_cents').default(0),
  permissions: jsonb('permissions').default({}),
  lastHeartbeatAt: timestamp('last_heartbeat_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_agents_org_shortname').on(t.orgId, t.shortname),
  index('idx_agents_org').on(t.orgId),
  index('idx_agents_reports_to').on(t.reportsTo),
]);

export const agentApiKeys = pgTable('agent_api_keys', {
  id: text('id').primaryKey().$defaultFn(createId),
  agentId: text('agent_id').notNull().references(() => agents.id),
  orgId: text('org_id').notNull().references(() => organizations.id),
  keyHash: text('key_hash').notNull().unique(),
  lastUsedAt: timestamp('last_used_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const agentConfigRevisions = pgTable('agent_config_revisions', {
  id: text('id').primaryKey().$defaultFn(createId),
  agentId: text('agent_id').notNull().references(() => agents.id),
  source: text('source').notNull().default('patch'),
  changedKeys: jsonb('changed_keys').default([]),
  beforeConfig: jsonb('before_config').notNull(),
  afterConfig: jsonb('after_config').notNull(),
  rolledBackFromRevisionId: text('rolled_back_from_revision_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_agent_config_revisions_agent').on(t.agentId),
]);

export const agentRuntimeState = pgTable('agent_runtime_state', {
  id: text('id').primaryKey().$defaultFn(createId),
  agentId: text('agent_id').notNull().references(() => agents.id).unique(),
  sessionId: text('session_id'),
  stateJson: jsonb('state_json').default({}),
  lastRunId: text('last_run_id'),
  lastRunStatus: text('last_run_status'),
  totalInputTokens: bigint('total_input_tokens', { mode: 'number' }).default(0),
  totalOutputTokens: bigint('total_output_tokens', { mode: 'number' }).default(0),
  totalCachedInputTokens: bigint('total_cached_input_tokens', { mode: 'number' }).default(0),
  totalCostCents: bigint('total_cost_cents', { mode: 'number' }).default(0),
  lastError: text('last_error'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const agentTaskSessions = pgTable('agent_task_sessions', {
  id: text('id').primaryKey().$defaultFn(createId),
  agentId: text('agent_id').notNull().references(() => agents.id),
  adapterType: text('adapter_type').notNull(),
  taskKey: text('task_key').notNull(),
  sessionParamsJson: jsonb('session_params_json').default({}),
  sessionDisplayId: text('session_display_id'),
  lastRunId: text('last_run_id'),
  lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_agent_task_sessions_key').on(t.agentId, t.adapterType, t.taskKey),
]);
