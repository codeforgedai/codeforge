import { pgTable, text, timestamp, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { createId } from '../utils.js';
import { agents } from './agents.js';
import { organizations } from './tenancy.js';

export const wakeupRequests = pgTable('wakeup_requests', {
  id: text('id').primaryKey().$defaultFn(createId),
  agentId: text('agent_id').notNull().references(() => agents.id),
  orgId: text('org_id').notNull().references(() => organizations.id),
  source: text('source').notNull(),
  triggerDetail: text('trigger_detail'),
  status: text('status').notNull().default('queued'),
  payload: jsonb('payload'),
  coalescedCount: integer('coalesced_count').default(0),
  idempotencyKey: text('idempotency_key'),
  runId: text('run_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_wakeup_requests_agent').on(t.agentId),
  index('idx_wakeup_requests_status').on(t.status),
]);

export const heartbeatRuns = pgTable('heartbeat_runs', {
  id: text('id').primaryKey().$defaultFn(createId),
  agentId: text('agent_id').notNull().references(() => agents.id),
  orgId: text('org_id').notNull().references(() => organizations.id),
  invocationSource: text('invocation_source').notNull(),
  triggerDetail: text('trigger_detail'),
  status: text('status').notNull().default('queued'),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
  usageJson: jsonb('usage_json'),
  resultJson: jsonb('result_json'),
  sessionIdBefore: text('session_id_before'),
  sessionIdAfter: text('session_id_after'),
  errorCode: text('error_code'),
  contextSnapshot: jsonb('context_snapshot'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_heartbeat_runs_agent').on(t.agentId),
  index('idx_heartbeat_runs_status').on(t.status),
]);

export const heartbeatRunEvents = pgTable('heartbeat_run_events', {
  id: text('id').primaryKey().$defaultFn(createId),
  runId: text('run_id').notNull().references(() => heartbeatRuns.id),
  seq: integer('seq').notNull(),
  eventType: text('event_type').notNull(),
  stream: text('stream'),
  level: text('level'),
  message: text('message'),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_heartbeat_run_events_run').on(t.runId),
]);
