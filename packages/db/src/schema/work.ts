import { pgTable, text, timestamp, jsonb, integer, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createId } from '../utils.js';
import { organizations } from './tenancy.js';
import { agents } from './agents.js';

export const labels = pgTable('labels', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_labels_org_name').on(t.orgId, t.name),
]);

export const teams = pgTable('teams', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  pipelineConfigId: text('pipeline_config_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const goals = pgTable('goals', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  title: text('title').notNull(),
  description: text('description'),
  level: text('level').notNull().default('task'),
  status: text('status').notNull().default('planned'),
  parentId: text('parent_id'),
  ownerAgentId: text('owner_agent_id').references(() => agents.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('idx_goals_org').on(t.orgId),
  index('idx_goals_parent').on(t.parentId),
]);

export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  goalId: text('goal_id').references(() => goals.id),
  leadAgentId: text('lead_agent_id').references(() => agents.id),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('backlog'),
  targetDate: timestamp('target_date'),
  color: text('color'),
  archivedAt: timestamp('archived_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('idx_projects_org').on(t.orgId),
]);

export const projectWorkspaces = pgTable('project_workspaces', {
  id: text('id').primaryKey().$defaultFn(createId),
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  cwd: text('cwd'),
  repoUrl: text('repo_url'),
  repoRef: text('repo_ref'),
  metadata: jsonb('metadata'),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projectDocs = pgTable('project_docs', {
  id: text('id').primaryKey().$defaultFn(createId),
  projectId: text('project_id').notNull().references(() => projects.id),
  title: text('title').notNull(),
  content: text('content'),
  docType: text('doc_type').notNull().default('other'),
  createdByType: text('created_by_type'),
  createdById: text('created_by_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  projectId: text('project_id').references(() => projects.id),
  goalId: text('goal_id').references(() => goals.id),
  parentId: text('parent_id'),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('backlog'),
  priority: text('priority').default('medium'),
  assigneeAgentId: text('assignee_agent_id').references(() => agents.id),
  assigneeUserId: text('assignee_user_id'),
  identifier: text('identifier'),
  issueNumber: integer('issue_number'),
  requestDepth: integer('request_depth').default(0),
  billingCode: text('billing_code'),
  executionRunId: text('execution_run_id'),
  executionLockedAt: timestamp('execution_locked_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  index('idx_tasks_org').on(t.orgId),
  index('idx_tasks_project').on(t.projectId),
  index('idx_tasks_assignee_agent').on(t.assigneeAgentId),
  index('idx_tasks_status').on(t.status),
]);

export const taskComments = pgTable('task_comments', {
  id: text('id').primaryKey().$defaultFn(createId),
  taskId: text('task_id').notNull().references(() => tasks.id),
  authorAgentId: text('author_agent_id'),
  authorUserId: text('author_user_id'),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const taskLabels = pgTable('task_labels', {
  id: text('id').primaryKey().$defaultFn(createId),
  taskId: text('task_id').notNull().references(() => tasks.id),
  labelId: text('label_id').notNull().references(() => labels.id),
}, (t) => [
  uniqueIndex('idx_task_labels_unique').on(t.taskId, t.labelId),
]);

export const taskAttachments = pgTable('task_attachments', {
  id: text('id').primaryKey().$defaultFn(createId),
  taskId: text('task_id').notNull().references(() => tasks.id),
  assetId: text('asset_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const taskReadStates = pgTable('task_read_states', {
  id: text('id').primaryKey().$defaultFn(createId),
  taskId: text('task_id').notNull().references(() => tasks.id),
  userId: text('user_id').notNull(),
  lastReadAt: timestamp('last_read_at').notNull(),
}, (t) => [
  uniqueIndex('idx_task_read_states_unique').on(t.taskId, t.userId),
]);

export const pullRequests = pgTable('pull_requests', {
  id: text('id').primaryKey().$defaultFn(createId),
  taskId: text('task_id').references(() => tasks.id),
  projectId: text('project_id').references(() => projects.id),
  githubPrNumber: integer('github_pr_number'),
  url: text('url'),
  status: text('status'),
  reviewVerdict: text('review_verdict'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
