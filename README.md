<p align="center">
  <h1 align="center">Codeforge</h1>
  <p align="center"><strong>Open-source orchestration for autonomous AI dev teams</strong></p>
</p>

<p align="center">
  <a href="#quickstart"><strong>Quickstart</strong></a> &middot;
  <a href="https://github.com/codeforgedai/codeforge"><strong>GitHub</strong></a>
</p>

<br/>

## What is Codeforge?

# Open-source orchestration for autonomous AI dev teams

**If Claude Agent SDK is an _employee_, Codeforge is the _company_.**

Codeforge orchestrates a team of AI agents to ship software. Bring your own agents, define an org chart, assign goals, and track your agents' work and costs from one dashboard.

It looks like a project manager — but under the hood it has org charts, budgets, governance, goal alignment, and agent coordination.

**Manage business goals, not pull requests.**

```
                              ┌─────────────────────────────────────┐
                              │            YOUR COMPANY             │
                              │         "Build a SaaS app"          │
                              └──────────────┬──────────────────────┘
                                             │
                    ┌────────────────────────────────────────────────┐
                    │                  EXECUTIVE                     │
                    │                                                │
                    │    ┌───────┐         ┌───────┐                │
                    │    │  CEO  │────────→│  CTO  │                │
                    │    └───────┘ reports └───┬───┘                │
                    │    $500/mo   to CEO      │      $300/mo       │
                    └─────────────────────────┬┬────────────────────┘
                                              ││
                         ┌────────────────────┘└────────────────┐
                         │                                      │
          ┌──────────────┴───────────────┐    ┌────────────────┴──────────────┐
          │         ENGINEERING          │    │           QA / REVIEW         │
          │                              │    │                               │
          │  ┌───────┐  ┌───────┐       │    │  ┌──────────┐  ┌──────────┐  │
          │  │ SWE-1 │  │ SWE-2 │  ...  │    │  │ Reviewer │  │    PM    │  │
          │  └───────┘  └───────┘       │    │  └──────────┘  └──────────┘  │
          │  $2000/mo    $2000/mo       │    │  $100/mo        $100/mo      │
          │  Claude SDK  Codex          │    │  thin context   thin context │
          │  fat context fat context    │    │                               │
          └─────────────────────────────┘    └───────────────────────────────┘
                         │                                      │
                         └──────────────┬───────────────────────┘
                                        │
                              ┌─────────▼──────────┐
                              │     PIPELINE        │
                              │                     │
                              │  plan → implement   │
                              │  → review → revise  │
                              │  → merge            │
                              └─────────────────────┘
```

<br/>

<div align="center">
<table>
  <tr>
    <td align="center"><strong>Works<br/>with</strong></td>
    <td align="center"><sub>Claude<br/>Agent SDK</sub></td>
    <td align="center"><sub>Claude<br/>Code</sub></td>
    <td align="center"><sub>Codex</sub></td>
    <td align="center"><sub>Cursor</sub></td>
    <td align="center"><sub>OpenClaw</sub></td>
    <td align="center"><sub>Bash</sub></td>
    <td align="center"><sub>HTTP</sub></td>
  </tr>
</table>

<em>If it can receive a heartbeat, it's hired.</em>

</div>

<br/>

## Codeforge is right for you if

- You want to build **autonomous AI dev teams**
- You **coordinate many different agents** (Claude, Codex, Cursor, OpenClaw) toward a common goal
- You have **20 simultaneous agent sessions** open and lose track of what everyone is doing
- You want agents running **autonomously 24/7**, but still want to audit work and chime in when needed
- You want to **monitor costs** and enforce budgets per agent
- You want a process for managing agents that **feels like using a project manager**
- You want to manage your autonomous dev teams **from your phone**

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
Structured multi-step workflows — plan, implement, review, revise, merge — with automatic handoff between agents and live SSE streaming.
</td>
</tr>
<tr>
<td align="center">
<h3>Governance</h3>
You're the board. Approve hires, override strategy, pause or terminate any agent — at any time. Config changes are revisioned and rollback-safe.
</td>
<td align="center">
<h3>Org Chart</h3>
Hierarchies, roles, reporting lines. Your agents have a boss, a title, and a job description.
</td>
<td align="center">
<h3>Encrypted Secrets</h3>
AES-256-GCM encryption at rest. Per-org credential management with versioning and key rotation.
</td>
</tr>
</table>

<br/>

## Problems Codeforge solves

| Without Codeforge | With Codeforge |
|---|---|
| You have 20 agent sessions open and can't track which one does what. On reboot you lose everything. | Tasks are ticket-based, conversations are threaded, sessions persist across reboots. |
| You manually gather context from several places to remind your agent what you're doing. | Context flows from the task up through the project and company goals — your agent always knows what to do and why. |
| Folders of agent configs are disorganized and you're re-inventing task management and coordination. | Codeforge gives you org charts, ticketing, delegation, and governance out of the box. |
| Runaway loops waste hundreds of dollars of tokens before you even know what happened. | Cost tracking surfaces token budgets and auto-pauses agents when they're out of budget. |
| You have recurring jobs and have to remember to manually kick them off. | Heartbeats handle regular work on a schedule. Management supervises. |
| You have an idea, find your repo, fire up an agent, keep a tab open, and babysit it. | Add a task in Codeforge. Your coding agent works on it until it's done. Management reviews. |

<br/>

## Why Codeforge is special

Codeforge handles the hard orchestration details correctly.

|                                   |                                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Atomic execution.**             | Task checkout and budget enforcement are atomic SQL, so no double-work and no runaway spend.                  |
| **Persistent agent state.**       | Agents resume the same task context across heartbeats instead of restarting from scratch.                     |
| **Two execution modes.**          | Autonomous (heartbeat) for strategy work. Pipeline (structured steps) for implementation. Agents use both.    |
| **Governance with rollback.**     | Approval gates are enforced, config changes are revisioned, and bad changes can be rolled back safely.        |
| **Goal-aware execution.**         | Tasks carry full goal ancestry so agents consistently see the "why," not just a title.                        |
| **True multi-tenant isolation.**  | Every entity is org-scoped. Memory thread IDs are namespaced. One deployment runs many orgs with separate data. |

<br/>

## What Codeforge is not

|                              |                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Not a chatbot.**           | Agents have jobs, not chat windows.                                                                                  |
| **Not an agent framework.**  | We don't tell you how to build agents. We tell you how to run a company made of them.                                |
| **Not a workflow builder.**  | No drag-and-drop pipelines. Codeforge models companies — with org charts, goals, budgets, and governance.            |
| **Not a single-agent tool.** | This is for teams. If you have one agent, you probably don't need Codeforge. If you have twenty — you definitely do. |

<br/>

## Architecture

```
Dashboard (Vite)             Server (Express)              Worker (BullMQ)
       │                              │                                │
       │                              │     ┌──── AUTONOMOUS MODE ────┐│
       │  POST /agents/:id/wakeup    │     │                          │
       │─────────────────────────────→│     │  Heartbeat timer tick    │
       │                              │     │  OR assignment event     │
       │                              │     │  OR on-demand trigger    │
       │                              │  create wakeup_request         │
       │                              │  enqueue job → Redis ─────────→│
       │                              │                                │  claim job
       │                              │                                │  resolve workspace
       │  WS: agent events            │  Redis pub/sub                 │  resolve session
       │←─────────────────────────────│←───────────────────────────────│  build agent
       │                              │                                │  execute
       │                              │     ┌──── PIPELINE MODE ──────┐│
       │  POST /api/v1/pipelines/run  │     │                          │
       │─────────────────────────────→│     │                          │
       │                              │  create pipeline_run           │
       │                              │  build workflow from YAML      │
       │                              │  enqueue job → Redis ─────────→│
       │                              │                                │  claim job
       │  SSE: step events            │  Redis pub/sub                 │  run workflow
       │←─────────────────────────────│←───────────────────────────────│  emit step events
       │                              │                                │  record costs
```

### Two execution modes

| Mode | Trigger | Used for |
|------|---------|----------|
| **Autonomous** | Heartbeat timer, task assignment, on-demand, @mention | CEO strategy, CTO decomposition, any agent acting independently |
| **Pipeline** | API trigger, task assignment to pipeline | Structured multi-step work: plan → implement → review → deliver |

Agents operate in both modes. A CTO might run autonomously to decompose work, then trigger a pipeline for each sub-task.

### What happens when a pipeline runs

```
Task: "Add GET /health endpoint"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ PM Review                          0.2s   $0.001
     "Task is clear. Acceptance criteria: ..."

  ✅ Architect Design                   4.1s   $0.01
     "Modify src/routes/index.ts, add health.ts ..."

  🔄 SWE Implementation               2:34    $0.14
     ├─ Cloned repo
     ├─ Created branch feat/task-123
     ├─ Writing src/routes/health.ts
     ├─ Running tests... 14/14 passed
     └─ Creating PR...

  ⏳ Code Review                        —      —

  ⏳ Report                             —      —

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Running   │   Total: $0.15   │   Budget remaining: $4.85
```

Each step streams output live via SSE. If the reviewer requests changes, the pipeline automatically loops back to SWE (up to `max_iterations` times).

<br/>

## Agent system

### Lifecycle state machine

```
                    ┌──────────────────┐
                    │ pending_approval │
                    └────────┬─────────┘
                             │ human approves
                             ▼
  create ──────→ ┌──────┐ heartbeat ┌─────────┐
                 │ idle │──────────→│ running │
                 └──┬───┘←─────────└────┬────┘
                    │    success         │ failure
                    │                    ▼
                    │              ┌─────────┐
                    │              │  error  │──→ resume ──→ idle
                    │              └─────────┘
              pause │ ──→ ┌────────┐ resume ──→ idle
                         │ paused │
                         └────────┘
           terminate│ ──→ ┌────────────┐ (revokes all API keys)
                         │ terminated │
                         └────────────┘
```

### Agent context modes

| Mode | What's injected | Token cost | Used by |
|------|----------------|------------|---------|
| `thin` | Task description only | Low | Reviewer, PM |
| `fat` | Full project context, docs, recent activity, team state | High | CEO, CTO |

### Platform tools

Every agent gets access to org-scoped platform tools:

| Tool | What it does | Typical user |
|------|-------------|-------------|
| `write_project_doc` | Create/update markdown doc in project knowledge base | CEO, CTO |
| `read_project_docs` | Read all project docs for context | Any agent |
| `create_goal` | Create a goal in the OKR hierarchy | CEO |
| `create_task` | Create a task and optionally assign it | CEO, CTO |
| `update_task` | Update task status, priority, assignee | CTO, PM |
| `add_task_comment` | Post a comment on a task | Any agent |
| `list_tasks` | List tasks with filters | Any agent |
| `read_pr_diff` | Fetch PR diff from GitHub | Reviewer |
| `trigger_pipeline` | Trigger a pipeline run for a task | CTO, PM |
| `request_approval` | Request human approval for an action | Any agent |
| `hire_agent` | Request creation of a new agent | CEO, CTO |

SWE agents additionally get full filesystem access via the Claude Agent SDK (`Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`).

### @mention triggered wakeups

```
User comments: "@cto please review the architecture for task PRJ-42"
  │
  ├─ Parse mentions from comment body
  ├─ Resolve agent by shortname within org
  ├─ Create wakeup_request with source: "automation", trigger: "mention"
  └─ Agent wakes up with mention context in next heartbeat
```

<br/>

## Packages

```
codeforge/
├── packages/
│   ├── shared/        ← Types, validators, constants, YAML config parser
│   ├── db/            ← Drizzle schema (39+ tables), PGlite/Postgres connection
│   ├── execution/     ← Platform tools, agent bridge, workflow builder, adapters
│   ├── server/        ← REST API, auth, middleware, routes, realtime, heartbeat
│   ├── worker/        ← BullMQ consumers for heartbeat and pipeline queues
│   ├── dashboard/     ← Vite + TanStack Router + shadcn/ui
│   └── cli/           ← CLI with profile switching
├── config/            ← Team YAML templates
└── package.json
```

| Package | Description |
|---------|------------|
| `@codeforce/shared` | Types, constants, validators, YAML config parser with cycle detection |
| `@codeforce/db` | Drizzle ORM schema (39+ tables), PGlite/Postgres dual-mode connection |
| `@codeforce/execution` | Platform tools, agent bridge, step registry, workflow builder, Claude Agent SDK adapter |
| `@codeforce/server` | Express API, BetterAuth, org-scoped middleware, CRUD routes, SSE/WebSocket realtime, heartbeat scheduler, encrypted secrets |
| `@codeforce/worker` | BullMQ processors for heartbeat and pipeline queues with budget enforcement |
| `@codeforce/dashboard` | Management dashboard — agents, tasks, pipelines, goals, approvals, billing, inbox, settings |
| `@codeforce/cli` | CLI with profile switching, agent/pipeline/org commands, db management |

### Data model

39+ tables covering six domains:

| Domain | Tables | Key entities |
|--------|--------|-------------|
| Tenancy & Auth | 10 | organizations, users, sessions, org_memberships, api_keys, invites |
| Agents | 5 | agents, agent_api_keys, agent_config_revisions, agent_runtime_state, agent_task_sessions |
| Heartbeat | 3 | wakeup_requests, heartbeat_runs, heartbeat_run_events |
| Work | 10 | goals, projects, project_workspaces, project_docs, tasks, task_comments, task_labels, pull_requests |
| Pipeline | 4 | pipeline_configs, pipeline_runs, pipeline_steps, agent_runs |
| Governance & Billing | 8 | approvals, secrets, secret_versions, cost_events, budgets, activity_log, assets, run_logs |

All data org-scoped for multi-tenant isolation. All monetary values stored as integer cents.

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

## Team configuration

Teams are defined in YAML. See [config/default-team.yaml](config/default-team.yaml):

```yaml
agents:
  ceo:
    model: claude-sonnet-4-5
    role: ceo
    instructions: "You are the CEO. Define strategy, create goals, assign to CTO."
    tools: [approve_hire, set_goal]
    budget_monthly_cents: 50000
    permissions:
      canCreateAgents: true
      canApproveHires: true
      canModifyBudgets: true

  cto:
    model: claude-sonnet-4-5
    role: cto
    reports_to: ceo
    instructions: "You are the CTO. Decompose tasks, design architecture, assign to engineers."
    tools: [create_task, assign_task]
    budget_monthly_cents: 30000

  swe:
    model: claude-sonnet-4-5
    role: swe
    reports_to: cto
    adapter: claude-agent-sdk
    instructions: "You are a software engineer. Implement tasks assigned to you."
    tools: [read_file, write_file, run_tests]
    max_turns: 20
    context_mode: fat

  reviewer:
    model: claude-sonnet-4-5
    role: reviewer
    reports_to: cto
    tools: [read_file, comment]

pipeline:
  name: default-pipeline
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

## Process model

### Production

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Server    │    │   Worker    │    │  Dashboard  │
│  (express)  │◄──►│  (bullmq)  │    │   (vite)    │
│  port 3100  │    │             │    │  port 5173  │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └────────┬─────────┘                  │
                ▼                            │
         ┌───────────┐                       │
         │   Redis   │                       │
         └───────────┘                       │
                │                            │
         ┌───────────┐    ◄──────────────────┘
         │ PostgreSQL│    (server API calls)
         └───────────┘
```

### Dev (zero-config)

```
┌─────────────────────────┐    ┌─────────────┐
│  Server + Worker        │    │  Dashboard  │
│  (single process)       │    │  (vite dev) │
│  PGlite (embedded PG)   │    │  port 5173  │
│  EventEmitter pub/sub   │    │             │
│  port 3100              │    │             │
└─────────────────────────┘    └─────────────┘
```

Dev mode runs server + worker in one process with PGlite and EventEmitter-based pub/sub. No Docker, no Redis, no Postgres.

<br/>

## Development

```bash
pnpm dev              # Full dev (API + dashboard, watch mode)
pnpm build            # Build all packages
pnpm typecheck        # Type checking across all packages
pnpm test             # Run all tests (176 tests)
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply migrations
```

### CLI

```bash
codeforge config use dev          # http://localhost:3100
codeforge config use production   # https://api.codeforge.ai
codeforge agent list              # uses active profile
codeforge agent wake cto          # trigger wakeup
codeforge pipeline run task-123   # trigger pipeline
codeforge db backup               # pg_dump
```

<br/>

## Environment variables

See [.env.example](.env.example) for all options. In dev mode, only `ANTHROPIC_API_KEY` is needed for agent execution. Everything else has sensible defaults.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Production | PostgreSQL connection string |
| `REDIS_URL` | Production | Redis for BullMQ and pub/sub |
| `CODEFORCE_SECRETS_MASTER_KEY` | Production | 256-bit hex key for AES-256-GCM |
| `GITHUB_APP_ID` | Optional | GitHub App ID for repo access |
| `GITHUB_APP_PRIVATE_KEY_FILE` | Optional | Path to GitHub App private key PEM |
| `ANTHROPIC_API_KEY` | For execution | Default Claude API key (orgs can provide their own) |
| `NODE_ENV` | No | `production` / `development` |
| `PORT` | No | Server port (default 3100) |

<br/>

## Tech stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 20+, TypeScript (strict) |
| Package manager | pnpm workspaces |
| Server | Express (ultimate-express / uWebSockets.js) |
| Dashboard | Vite + TanStack Router + shadcn/ui + Tailwind |
| ORM | Drizzle |
| Database | PostgreSQL (PGlite for dev) |
| Job queue | BullMQ + Redis (in-memory fallback for dev) |
| Auth | BetterAuth (GitHub OAuth) |
| Agent execution | `@anthropic-ai/claude-agent-sdk` |
| Agent runtime | `@mastra/core` (Agent, createTool) |
| Schema validation | Zod |
| Real-time | WebSocket (org events) + SSE (run streams) |
| Encryption | AES-256-GCM (secrets at rest) |

<br/>

## License

MIT

<br/>

---

<p align="center">
  <sub>Open source under MIT. Built for people who want to run dev teams, not babysit terminals.</sub>
</p>
