# Development Guide

## Prerequisites

- Node.js 20+
- pnpm (`corepack enable`)

## Quick Start (Zero-Config)

```sh
pnpm install
pnpm dev
```

This starts the API server at `http://localhost:3100` with:
- **PGlite** — embedded PostgreSQL, no external database needed
- **EventEmitter pub/sub** — replaces Redis for real-time events
- **In-memory queues** — replaces BullMQ/Redis for job processing

The dashboard dev server runs at `http://localhost:5173`.

No Docker, no Redis, no Postgres required for development.

## Scripts

```sh
pnpm dev              # Start all packages in dev/watch mode
pnpm build            # Build all packages
pnpm typecheck        # TypeScript check across all packages
pnpm test             # Run all tests (176 tests)
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply Drizzle migrations
```

## Package-Specific Dev

```sh
pnpm --filter @codeforce/server dev      # Server only
pnpm --filter @codeforce/dashboard dev   # Dashboard only
pnpm --filter @codeforce/db test         # DB tests only
```

## Quick Health Check

```sh
curl http://localhost:3100/health
# → {"status":"ok"}

curl http://localhost:3100/api/v1/orgs
# → []
```

## Database

### Dev Mode (PGlite)

Leave `DATABASE_URL` unset. An embedded PGlite database is created automatically in `data/pglite/`.

To reset the dev database:
```sh
rm -rf data/pglite
pnpm dev
```

### Production (PostgreSQL)

Set `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgres://codeforce:pass@localhost:5432/codeforce
```

### Schema Changes

1. Edit schema files in `packages/db/src/schema/`
2. Export new tables from `packages/db/src/schema/index.ts`
3. Generate migration: `pnpm db:generate`
4. Validate: `pnpm typecheck`

## Environment Variables

Copy `.env.example` to `.env` for production configuration:

```sh
cp .env.example .env
```

See [.env.example](.env.example) for all available options.

| Variable | Dev Default | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | PGlite (embedded) | PostgreSQL connection string |
| `REDIS_URL` | EventEmitter (in-memory) | Redis for BullMQ and pub/sub |
| `CODEFORCE_SECRETS_MASTER_KEY` | Auto-generated | AES-256-GCM encryption key |
| `ANTHROPIC_API_KEY` | — | Required for agent execution |
| `PORT` | 3100 | Server port |

## Verification

Before submitting changes, always run:

```sh
pnpm typecheck
pnpm test
pnpm build
```

## Project Structure

```
codeforge/
├── packages/
│   ├── shared/        ← Types, constants, validators (no deps on other packages)
│   ├── db/            ← Drizzle schema, depends on shared
│   ├── execution/     ← Agent bridge, tools, depends on shared + db
│   ├── server/        ← Express API, depends on shared + db + execution
│   ├── worker/        ← BullMQ processors, depends on shared + db + execution
│   ├── dashboard/     ← Vite + TanStack Router (standalone, calls server API)
│   └── cli/           ← CLI tool (standalone, calls server API)
├── config/            ← Team YAML templates
├── AGENTS.md          ← AI contributor guide
├── CLAUDE.md          ← Claude Code instructions
├── CONTRIBUTING.md    ← Human contributor guide
└── DEVELOPMENT.md     ← This file
```
