# AGENTS.md

Guidance for human and AI contributors working in this repository.

## 1. Purpose

Codeforge is an open-source orchestration platform for autonomous AI dev teams.
The current implementation target is V1 and is defined in `docs/superpowers/specs/2026-03-15-codeforce-v2-design.md`.

## 2. Read This First

Before making changes, read in this order:

1. `docs/superpowers/specs/2026-03-15-codeforce-v2-design.md` — Design spec and V1 build contract
2. `DEVELOPMENT.md` — Development setup and workflow
3. `config/default-team.yaml` — Default agent team template

## 3. Repo Map

- `packages/shared/` — Types, constants, validators, YAML config parser
- `packages/db/` — Drizzle schema (39+ tables), PGlite/Postgres connection
- `packages/execution/` — Platform tools, agent bridge, workflow builder, Claude Agent SDK adapter
- `packages/server/` — Express REST API, auth, middleware, routes, realtime, heartbeat scheduler
- `packages/worker/` — BullMQ processors for heartbeat and pipeline queues
- `packages/dashboard/` — Vite + TanStack Router + shadcn/ui management dashboard
- `packages/cli/` — CLI with profile switching
- `config/` — Team YAML templates

## 4. Dev Setup (Zero-Config)

Use embedded PGlite in dev by leaving `DATABASE_URL` unset.

```sh
pnpm install
pnpm dev
```

This starts:

- API: `http://localhost:3100`
- Dashboard: `http://localhost:5173`

Quick checks:

```sh
curl http://localhost:3100/health
curl http://localhost:3100/api/v1/orgs
```

## 5. Core Engineering Rules

1. **Keep changes org-scoped.**
Every domain entity is scoped to an organization. Org boundaries must be enforced in routes and services.

2. **Keep contracts synchronized.**
If you change schema/API behavior, update all impacted layers:
- `packages/db` schema and exports
- `packages/shared` types/constants/validators
- `packages/server` routes/services
- `packages/dashboard` API clients and pages

3. **Preserve control-plane invariants.**
- Agent lifecycle state machine transitions
- Atomic task checkout semantics
- Approval gates for governed actions (hires, budget changes, deploys)
- Budget hard-stop auto-pause behavior
- Activity logging for mutating actions
- Multi-tenant isolation (org-scoped queries, namespaced memory threads)

4. **Do not replace strategic docs wholesale unless asked.**
Prefer additive updates. Keep specs aligned with implementation.

## 6. Database Change Workflow

When changing data model:

1. Edit `packages/db/src/schema/*.ts`
2. Ensure new tables are exported from `packages/db/src/schema/index.ts`
3. Generate migration: `pnpm db:generate`
4. Validate compile: `pnpm typecheck`

## 7. Verification Before Hand-off

Run this full check before claiming done:

```sh
pnpm typecheck
pnpm test
pnpm build
```

If anything cannot be run, explicitly report what was not run and why.

## 8. API and Auth Expectations

- Base path: `/api/v1`
- Human users authenticate via BetterAuth (GitHub OAuth)
- Agents use bearer API keys (`agent_api_keys`), hashed at rest
- Agent keys must not access other organizations

When adding endpoints:

- Apply org access checks
- Enforce actor permissions (user vs agent)
- Write activity log entries for mutations
- Return consistent HTTP errors (`400/401/403/404/409/422/500`)
- Validate request bodies with Zod

## 9. Dashboard Expectations

- Keep routes and nav aligned with available API surface
- Use org selection context for org-scoped pages
- Surface failures clearly; do not silently ignore API errors

## 10. Definition of Done

A change is done when all are true:

1. Behavior matches the design spec
2. Typecheck, tests, and build pass
3. Contracts are synced across db/shared/server/dashboard
4. Docs updated when behavior or commands change
