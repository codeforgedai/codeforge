<p align="center">
  <h1 align="center">Codeforge</h1>
  <p align="center"><strong>Open-source AI dev team orchestration</strong></p>
</p>

<p align="center">
  <a href="#quickstart"><strong>Quickstart</strong></a> &middot;
  <a href="https://github.com/codeforgedai/codeforge"><strong>GitHub</strong></a>
</p>

<br/>

## What is Codeforge?

Codeforge is a Node.js server and React dashboard that orchestrates a team of AI agents to ship software. Define an org chart, assign goals, set budgets, and let your agents collaborate through structured pipelines — plan, implement, review, revise, merge.

It looks like a project manager — but under the hood it has org charts, budgets, governance, goal alignment, and agent coordination.

**Manage business goals, not terminal tabs.**

| | Step | Example |
|------|-----------------|---------------------------------------------------------------------|
| **01** | Define the goal | _"Build the authentication system with OAuth and MFA support."_ |
| **02** | Hire the team | CEO, CTO, engineers, reviewers — any agent, any provider. |
| **03** | Approve and run | Review strategy. Set budgets. Hit go. Monitor from the dashboard. |

<br/>

<div align="center">
<table>
  <tr>
    <td align="center"><strong>Works<br/>with</strong></td>
    <td align="center"><sub>Claude Agent SDK</sub></td>
    <td align="center"><sub>HTTP Agents</sub></td>
    <td align="center"><sub>Process Agents</sub></td>
  </tr>
</table>

<em>If it can receive a heartbeat, it's hired.</em>

</div>

<br/>

## Codeforge is right for you if

- You want to build **autonomous AI dev teams**
- You **coordinate multiple agents** toward a common goal
- You have **multiple agent sessions** open and lose track of what everyone is doing
- You want agents running **autonomously**, but still want to audit work and chime in when needed
- You want to **monitor costs** and enforce budgets per agent
- You want a process for managing agents that **feels like using a project manager**

<br/>

## Features

<table>
<tr>
<td align="center" width="33%">
<h3>Bring Your Own Agent</h3>
Any agent, any runtime, one org chart. Claude Agent SDK, HTTP, or process-based — if it can receive a heartbeat, it's hired.
</td>
<td align="center" width="33%">
<h3>Goal Alignment</h3>
Hierarchical goals (outcome → objective → task). Every task traces back to the mission. Agents know <em>what</em> to do and <em>why</em>.
</td>
<td align="center" width="33%">
<h3>Heartbeats</h3>
Agents wake on a schedule, check their queue, and act. Delegation flows up and down the org chart.
</td>
</tr>
<tr>
<td align="center">
<h3>Cost Control</h3>
Monthly budgets per agent. When they hit the limit, they stop. No runaway costs.
</td>
<td align="center">
<h3>Multi-Tenant</h3>
One deployment, many orgs. Complete data isolation. One control plane for everything.
</td>
<td align="center">
<h3>Pipelines</h3>
Define step-by-step workflows — plan, implement, review, revise, merge — with automatic handoff between agents.
</td>
</tr>
<tr>
<td align="center">
<h3>Governance</h3>
Approve hires, override strategy, pause or terminate any agent — at any time. Config changes are revisioned and rollback-safe.
</td>
<td align="center">
<h3>Org Chart</h3>
Hierarchies, roles, reporting lines. Your agents have a boss, a title, and a job description.
</td>
<td align="center">
<h3>Dashboard</h3>
Monitor agents, tasks, pipelines, goals, approvals, budgets, and activity — all from one UI.
</td>
</tr>
</table>

<br/>

## Architecture

```
                    ┌───────────┐
                    │ Dashboard │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
    CLI ──────────▶ │  Server   │────────▶ Realtime (SSE/WS)
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │  Worker   │
                    └─────┬─────┘
                          │
                    ┌─────▼─────┐
                    │ Execution │
                    └─────┬─────┘
                          │
                  ┌───────▼────────┐
                  │ Claude Agent   │
                  │ SDK / HTTP     │
                  └────────────────┘
```

### How it works

1. **Teams are defined in YAML** — agents, roles, reporting lines, budgets, and a pipeline
2. **The server manages state** — orgs, agents, tasks, goals, approvals, secrets, and audit logs across 39+ database tables
3. **The heartbeat scheduler** wakes agents on a cadence to check for pending work
4. **Pipelines** orchestrate multi-step workflows across agents — plan → implement → review → revise → merge
5. **The execution engine** bridges agents to platform tools (file ops, task management, goal tracking) with org-scoped memory isolation
6. **The dashboard** gives you real-time visibility into everything

<br/>

## Packages

| Package | Description |
|---------|------------|
| `@codeforce/shared` | Types, constants, validators, YAML config parser |
| `@codeforce/db` | Drizzle ORM schema (39+ tables), PGlite/Postgres dual-mode connection |
| `@codeforce/execution` | Platform tools, agent bridge, workflow builder, Claude Agent SDK adapter |
| `@codeforce/server` | Express API, auth, middleware, CRUD routes, realtime (SSE/WS), heartbeat scheduler |
| `@codeforce/worker` | BullMQ processors for heartbeat and pipeline queues |
| `@codeforce/dashboard` | Vite + TanStack Router + shadcn/ui management dashboard |
| `@codeforce/cli` | CLI with profile switching, agent/pipeline/org management |

<br/>

## Quickstart

```bash
git clone https://github.com/codeforgedai/codeforge.git
cd codeforge
pnpm install
pnpm dev
```

This starts the API server at `http://localhost:3100` with an embedded PGlite database and in-memory queues. No Postgres, no Redis — zero-config dev mode.

> **Requirements:** Node.js 20+, pnpm

For production, copy `.env.example` to `.env` and configure your Postgres, Redis, and API keys.

<br/>

## Team Configuration

Teams are defined in YAML. See [config/default-team.yaml](config/default-team.yaml):

```yaml
agents:
  ceo:
    role: ceo
    tools: [approve_hire, set_goal]
    budget_monthly_cents: 50000
  cto:
    role: cto
    reports_to: ceo
    tools: [create_task, assign_task]
  swe:
    role: swe
    reports_to: cto
    adapter: claude-agent-sdk
    tools: [read_file, write_file, run_tests]
    context_mode: fat
  reviewer:
    role: reviewer
    reports_to: cto
    tools: [read_file, comment]

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
    - id: revise
      type: loop
      config: { max_iterations: 3, back_to: implement }
    - id: merge
      type: agent
      config: { agent: cto, action: merge }
```

<br/>

## Development

```bash
pnpm dev              # Full dev (API + dashboard, watch mode)
pnpm build            # Build all packages
pnpm typecheck        # Type checking across all packages
pnpm test             # Run all tests
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply migrations
```

<br/>

## Environment Variables

See [.env.example](.env.example) for all options. In dev mode, only `ANTHROPIC_API_KEY` is needed for agent execution. Everything else has sensible defaults.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Production | Postgres connection string |
| `REDIS_URL` | Production | Redis for BullMQ and pub/sub |
| `CODEFORCE_SECRETS_MASTER_KEY` | Production | AES-256-GCM key for secret encryption |
| `ANTHROPIC_API_KEY` | For execution | Claude API key |
| `GITHUB_APP_ID` | Optional | GitHub App for repo access |

<br/>

## Tech Stack

**Runtime:** TypeScript, Node.js, pnpm workspaces

**Server:** Express (ultimate-express), BetterAuth, BullMQ/Redis

**Database:** Drizzle ORM, PostgreSQL/PGlite

**Execution:** `@anthropic-ai/claude-agent-sdk`, `@mastra/core`, Zod

**Dashboard:** Vite, TanStack Router, shadcn/ui, Tailwind CSS

<br/>

## License

MIT

<br/>

---

<p align="center">
  <sub>Open source under MIT. Built for people who want to run dev teams, not babysit terminals.</sub>
</p>
