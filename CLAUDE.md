# CLAUDE.md

Instructions for Claude Code and AI assistants working in this repository.

## Project Overview

Codeforge is an AI dev team orchestration platform. Monorepo with 7 packages managed by pnpm workspaces.

## Quick Reference

```sh
pnpm install          # Install dependencies
pnpm dev              # Start dev mode (PGlite, no external deps)
pnpm typecheck        # Typecheck all packages
pnpm test             # Run all tests
pnpm build            # Build all packages
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply migrations
```

## Architecture

- `packages/shared` — Types, constants, validators (zero dependencies on other packages)
- `packages/db` — Drizzle ORM schema, depends on `shared`
- `packages/execution` — Agent bridge, platform tools, workflow builder, depends on `shared` + `db`
- `packages/server` — Express API, depends on `shared` + `db` + `execution`
- `packages/worker` — BullMQ processors, depends on `shared` + `db` + `execution`
- `packages/dashboard` — Vite + TanStack Router, standalone (calls server API)
- `packages/cli` — CLI tool, standalone (calls server API)

## Key Patterns

- All domain entities are org-scoped. Every query must filter by `orgId`.
- Agent memory thread IDs are namespaced: `org_{orgId}_agent_{agentId}_project_{projectId}`
- Two execution modes: Autonomous (heartbeat) and Pipeline (structured steps)
- Dev mode uses PGlite (embedded Postgres) and EventEmitter (no Redis)
- Secrets encrypted with AES-256-GCM, master key from env or auto-generated in dev

## Database

- Schema defined in `packages/db/src/schema/` (39+ tables across 6 domains)
- Use Drizzle schema objects for queries, never raw table name strings
- All monetary values stored as integer cents
- Use `bigint` for token counts

## Coding Standards

- TypeScript strict mode
- ESM modules (`"type": "module"`)
- Prefer small, focused functions with early returns
- No unnecessary comments or docstrings
- Run `pnpm typecheck && pnpm test` before considering work done
