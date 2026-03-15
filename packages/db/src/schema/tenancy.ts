import { pgTable, text, timestamp, jsonb, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { createId } from '../utils.js';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(createId),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(createId),
  token: text('token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(createId),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey().$defaultFn(createId),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'),
  budgetMonthlyCents: integer('budget_monthly_cents').default(0),
  spentMonthlyCents: integer('spent_monthly_cents').default(0),
  planTier: text('plan_tier').default('free'),
  deploymentMode: text('deployment_mode').default('local_trusted'),
  archivedAt: timestamp('archived_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orgMemberships = pgTable('org_memberships', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  principalType: text('principal_type').notNull(),
  principalId: text('principal_id').notNull(),
  membershipRole: text('membership_role').notNull().default('member'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  index('idx_org_memberships_org').on(t.orgId),
  uniqueIndex('idx_org_memberships_principal').on(t.orgId, t.principalType, t.principalId),
]);

export const instanceUserRoles = pgTable('instance_user_roles', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull().default('instance_admin'),
});

export const permissionGrants = pgTable('permission_grants', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  principalType: text('principal_type').notNull(),
  principalId: text('principal_id').notNull(),
  permissionKey: text('permission_key').notNull(),
  scope: jsonb('scope'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  lastUsedAt: timestamp('last_used_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invites = pgTable('invites', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  inviteType: text('invite_type').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  allowedJoinTypes: jsonb('allowed_join_types'),
  defaultsPayload: jsonb('defaults_payload'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const joinRequests = pgTable('join_requests', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  inviteId: text('invite_id').references(() => invites.id),
  requestType: text('request_type').notNull(),
  status: text('status').notNull().default('pending'),
  claimSecretHash: text('claim_secret_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
