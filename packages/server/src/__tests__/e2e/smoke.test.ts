import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createDb } from '@codeforce/db';
import { createApp } from '../../app.js';
import { sql } from 'drizzle-orm';

const TABLES: string[] = [
  `CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    budget_monthly_cents INTEGER DEFAULT 0,
    spent_monthly_cents INTEGER DEFAULT 0,
    plan_tier TEXT DEFAULT 'free',
    deployment_mode TEXT DEFAULT 'local_trusted',
    archived_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    shortname TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_approval',
    reports_to TEXT,
    adapter_type TEXT NOT NULL DEFAULT 'claude-agent-sdk',
    adapter_config JSONB DEFAULT '{}',
    runtime_config JSONB DEFAULT '{}',
    instructions TEXT,
    model TEXT NOT NULL DEFAULT 'claude-sonnet-4-5',
    tools JSONB DEFAULT '[]',
    context_mode TEXT NOT NULL DEFAULT 'thin',
    budget_monthly_cents INTEGER DEFAULT 0,
    spent_monthly_cents INTEGER DEFAULT 0,
    permissions JSONB DEFAULT '{}',
    last_heartbeat_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_agents_org_shortname ON agents(org_id, shortname)`,
  `CREATE TABLE IF NOT EXISTS agent_config_revisions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    agent_id TEXT NOT NULL REFERENCES agents(id),
    source TEXT NOT NULL DEFAULT 'patch',
    changed_keys JSONB DEFAULT '[]',
    before_config JSONB NOT NULL,
    after_config JSONB NOT NULL,
    rolled_back_from_revision_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
  )`,
];

describe('E2E smoke test', () => {
  let server: any;
  let db: any;
  let baseUrl: string;

  beforeAll(async () => {
    db = createDb();
    for (const ddl of TABLES) {
      await db.execute(sql.raw(ddl));
    }

    const app = createApp(db);
    const port = 3200 + Math.floor(Math.random() * 100);
    baseUrl = `http://localhost:${port}`;

    await new Promise<void>((resolve) => {
      server = app.listen(port, () => resolve());
    });
  }, 15000);

  afterAll(async () => {
    if (server?.close) {
      server.close();
    }
  });

  it('health check responds', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.ok).toBe(true);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  it('creates org -> creates agent -> verifies lifecycle', async () => {
    const orgRes = await fetch(`${baseUrl}/api/v1/orgs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Org' }),
    });
    expect(orgRes.status).toBe(201);
    const org = await orgRes.json();
    expect(org.id).toBeDefined();
    expect(org.name).toBe('Test Org');

    const agentRes = await fetch(`${baseUrl}/api/v1/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgId: org.id,
        name: 'Test Agent',
        shortname: 'test-agent',
        role: 'swe',
        model: 'claude-sonnet-4-5',
      }),
    });
    expect(agentRes.status).toBe(201);
    const agent = await agentRes.json();
    expect(agent.status).toBe('pending_approval');
    expect(agent.name).toBe('Test Agent');

    const getOrgRes = await fetch(`${baseUrl}/api/v1/orgs/${org.id}`);
    expect(getOrgRes.status).toBe(200);
    const fetchedOrg = await getOrgRes.json();
    expect(fetchedOrg.name).toBe('Test Org');

    const getAgentRes = await fetch(`${baseUrl}/api/v1/agents/${agent.id}`);
    expect(getAgentRes.status).toBe(200);
    const fetchedAgent = await getAgentRes.json();
    expect(fetchedAgent.shortname).toBe('test-agent');
  });
});
