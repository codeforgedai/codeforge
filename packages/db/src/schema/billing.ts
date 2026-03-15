import { pgTable, text, timestamp, jsonb, integer, boolean, real, index } from 'drizzle-orm/pg-core';
import { createId } from '../utils.js';
import { organizations } from './tenancy.js';
import { agents } from './agents.js';

export const costEvents = pgTable('cost_events', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  agentId: text('agent_id').references(() => agents.id),
  taskId: text('task_id'),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens').default(0),
  outputTokens: integer('output_tokens').default(0),
  costCents: integer('cost_cents').notNull(),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
}, (t) => [
  index('idx_cost_events_org_time').on(t.orgId, t.occurredAt),
  index('idx_cost_events_agent_time').on(t.orgId, t.agentId, t.occurredAt),
]);

export const budgets = pgTable('budgets', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  agentId: text('agent_id').references(() => agents.id),
  monthlyLimitCents: integer('monthly_limit_cents').notNull(),
  currentSpendCents: integer('current_spend_cents').default(0),
  autoPause: boolean('auto_pause').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const activityLog = pgTable('activity_log', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  actorType: text('actor_type').notNull(),
  actorId: text('actor_id').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_activity_log_org_time').on(t.orgId, t.createdAt),
  index('idx_activity_log_entity').on(t.entityType, t.entityId),
]);

export const assets = pgTable('assets', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  provider: text('provider').notNull().default('local_disk'),
  objectKey: text('object_key').notNull(),
  contentType: text('content_type'),
  byteSize: integer('byte_size'),
  sha256: text('sha256'),
  originalFilename: text('original_filename'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const runLogs = pgTable('run_logs', {
  id: text('id').primaryKey().$defaultFn(createId),
  runId: text('run_id').notNull(),
  provider: text('provider').notNull().default('local_disk'),
  objectKey: text('object_key').notNull(),
  byteSize: integer('byte_size'),
  sha256: text('sha256'),
  compressed: boolean('compressed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const evaluationScores = pgTable('evaluation_scores', {
  id: text('id').primaryKey().$defaultFn(createId),
  runId: text('run_id'),
  agentId: text('agent_id').references(() => agents.id),
  pipelineRunId: text('pipeline_run_id'),
  scorerId: text('scorer_id').notNull(),
  score: real('score').notNull(),
  reasoning: text('reasoning'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
