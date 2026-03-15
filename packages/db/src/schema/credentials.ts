import { pgTable, text, timestamp, jsonb, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { createId } from '../utils.js';
import { organizations } from './tenancy.js';

export const secrets = pgTable('secrets', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  provider: text('provider').notNull().default('local_encrypted'),
  latestVersion: integer('latest_version').default(1),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_secrets_org_name').on(t.orgId, t.name),
]);

export const secretVersions = pgTable('secret_versions', {
  id: text('id').primaryKey().$defaultFn(createId),
  secretId: text('secret_id').notNull().references(() => secrets.id),
  version: integer('version').notNull(),
  material: jsonb('material').notNull(),
  valueSha256: text('value_sha256'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const githubInstallations = pgTable('github_installations', {
  id: text('id').primaryKey().$defaultFn(createId),
  orgId: text('org_id').notNull().references(() => organizations.id),
  installationId: text('installation_id').notNull(),
  accessTokenEncrypted: text('access_token_encrypted'),
  reposScope: jsonb('repos_scope'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
