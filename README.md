# Codeforce

AI outsourcing platform where companies spin up autonomous AI dev teams. Define agent hierarchies (CEO, CTO, SWE, Reviewer), assign budgets, and let them collaborate through structured pipelines to ship code.

## Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm
pnpm install

# Zero-config dev mode (PGlite, no Redis/Postgres needed)
pnpm --filter @codeforce/server dev

# Or with full infrastructure
cp .env.example .env  # fill in values
pnpm dev
```

Dev mode starts the server at `http://localhost:3100` with an embedded PGlite database and in-memory queues. No external services required.

## Packages

| Package | Description |
|---------|------------|
| `@codeforce/shared` | Types, constants, validators, YAML config parser |
| `@codeforce/db` | Drizzle ORM schema (39+ tables), PGlite/Postgres connection |
| `@codeforce/execution` | Platform tools, agent bridge, workflow builder, Claude Agent SDK adapter |
| `@codeforce/server` | Express API, auth, middleware, routes, realtime (SSE/WS), heartbeat scheduler |
| `@codeforce/worker` | BullMQ processors for heartbeat and pipeline queues |
| `@codeforce/dashboard` | Vite + TanStack Router + shadcn/ui dashboard |
| `@codeforce/cli` | CLI with profile switching, agent/pipeline/org management |

## Architecture

```
                    +-----------+
                    | Dashboard |
                    +-----+-----+
                          |
                    +-----v-----+
    CLI ----------->|  Server   |--------> Realtime (SSE/WS)
                    +-----+-----+
                          |
                    +-----v-----+
                    |  Worker   |
                    +-----+-----+
                          |
                    +-----v-----+
                    | Execution |
                    +-----+-----+
                          |
                  +-------v--------+
                  | Claude Agent   |
                  | SDK            |
                  +----------------+
```

Agents are organized in reporting hierarchies within an org. A **pipeline** defines a sequence of steps (plan -> implement -> review -> revise -> merge) that agents execute. The **heartbeat** scheduler wakes agents periodically to check for pending work.

## Key Concepts

- **Org** - tenant boundary. All agents, tasks, budgets, and secrets are org-scoped.
- **Agent** - an AI team member with a role, model, tools, budget, and instructions.
- **Pipeline** - a sequence of steps that agents execute to complete work.
- **Heartbeat** - periodic wakeup for agents to process their queue.
- **Goal** - hierarchical objectives (outcome -> objective -> task) that track team progress.
- **Approval** - governance gate for hires, budget changes, and deploys.

## Team Configuration

Teams are defined in YAML. See [config/default-team.yaml](config/default-team.yaml) for the default template:

```yaml
agents:
  ceo:
    role: ceo
    tools: [approve_hire, set_goal]
    budget_monthly_cents: 50000
  swe:
    role: swe
    adapter: claude-agent-sdk
    tools: [read_file, write_file, run_tests]
    context_mode: fat

pipeline:
  steps:
    - id: plan
      type: agent
      config: { agent: cto, action: plan_tasks }
    - id: implement
      type: agent
      config: { agent: swe, action: implement }
    - id: review
      type: agent
      config: { agent: reviewer, action: review }
```

## Scripts

```bash
pnpm test          # run all tests
pnpm typecheck     # typecheck all packages
pnpm build         # build all packages
pnpm db:generate   # generate Drizzle migrations
pnpm db:migrate    # run Drizzle migrations
```

## Environment Variables

See [.env.example](.env.example) for all options. In dev mode, only `ANTHROPIC_API_KEY` is needed for agent execution. Everything else has sensible defaults.

## Tech Stack

TypeScript, pnpm workspaces, Express (ultimate-express), Drizzle ORM, PostgreSQL/PGlite, BullMQ/Redis, Vite, TanStack Router, shadcn/ui, Tailwind, `@anthropic-ai/claude-agent-sdk`, `@mastra/core`, Zod.
