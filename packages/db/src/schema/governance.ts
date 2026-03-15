import { pgTable, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { createId } from '../utils.js';
import { organizations } from './tenancy.js';

export const approvals = pgTable('approvals', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  type: text('type').notNull(),
  requestedByAgentId: text('requested_by_agent_id'),
  requestedByUserId: text('requested_by_user_id'),
  status: text('status').notNull().default('pending'),
  payload: jsonb('payload'),
  decisionNote: text('decision_note'),
  decidedByUserId: text('decided_by_user_id'),
  decidedAt: timestamp('decided_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_approvals_org').on(t.orgId),
  index('idx_approvals_status').on(t.status),
]);

export const approvalComments = pgTable('approval_comments', {
  id: text('id').primaryKey().$defaultFn(createId),
  approvalId: text('approval_id').notNull().references(() => approvals.id),
  authorAgentId: text('author_agent_id'),
  authorUserId: text('author_user_id'),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
