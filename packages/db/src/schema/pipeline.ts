import { pgTable, text, timestamp, jsonb, integer, bigint, index } from 'drizzle-orm/pg-core';
import { createId } from '../utils.js';
import { agents } from './agents.js';
import { tasks, teams } from './work.js';

export const pipelineConfigs = pgTable('pipeline_configs', {
  id: text('id').primaryKey().$defaultFn(createId),
  teamId: text('team_id').references(() => teams.id),
  name: text('name').notNull(),
  serializedStepGraph: jsonb('serialized_step_graph').notNull(),
  schemaVersion: integer('schema_version').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pipelineRuns = pgTable('pipeline_runs', {
  id: text('id').primaryKey().$defaultFn(createId),
  taskId: text('task_id').references(() => tasks.id),
  pipelineConfigId: text('pipeline_config_id').references(() => pipelineConfigs.id),
  mastraWorkflowRunId: text('mastra_workflow_run_id'),
  status: text('status').notNull().default('running'),
  startedAt: timestamp('started_at').defaultNow(),
  finishedAt: timestamp('finished_at'),
  totalCostCents: integer('total_cost_cents').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_pipeline_runs_task').on(t.taskId),
  index('idx_pipeline_runs_status').on(t.status),
]);

export const pipelineSteps = pgTable('pipeline_steps', {
  id: text('id').primaryKey().$defaultFn(createId),
  pipelineRunId: text('pipeline_run_id').notNull().references(() => pipelineRuns.id),
  stepId: text('step_id').notNull(),
  agentId: text('agent_id').references(() => agents.id),
  status: text('status').notNull().default('pending'),
  order: integer('order').notNull(),
  inputJson: jsonb('input_json'),
  outputJson: jsonb('output_json'),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
  costCents: integer('cost_cents').default(0),
  retryCount: integer('retry_count').default(0),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_pipeline_steps_run').on(t.pipelineRunId),
]);

export const agentRuns = pgTable('agent_runs', {
  id: text('id').primaryKey().$defaultFn(createId),
  agentId: text('agent_id').notNull().references(() => agents.id),
  pipelineStepId: text('pipeline_step_id').references(() => pipelineSteps.id),
  heartbeatRunId: text('heartbeat_run_id'),
  status: text('status').notNull(),
  input: jsonb('input'),
  output: jsonb('output'),
  tokensIn: bigint('tokens_in', { mode: 'number' }).default(0),
  tokensOut: bigint('tokens_out', { mode: 'number' }).default(0),
  costCents: integer('cost_cents').default(0),
  durationMs: integer('duration_ms'),
  model: text('model'),
  adapterType: text('adapter_type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_agent_runs_agent').on(t.agentId),
]);
