# @codeforce/dashboard

Management dashboard for the Codeforce platform. Monitor AI agent teams, track tasks and pipelines, manage budgets, and handle governance approvals — all from a single interface.

Built with Vite, TanStack Router, shadcn/ui, and Tailwind CSS.

## Pages

- **Overview** — org-level metrics, active agents, recent activity
- **Agents** — agent list with status, role, budget usage; detail view with config and run history
- **Tasks** — task board with status filters, assignment, and priority
- **Pipelines** — pipeline list and live run view with SSE streaming
- **Goals** — hierarchical goal tracking (outcome → objective → task)
- **Approvals** — pending hire/budget/deploy approvals with approve/reject actions
- **Billing** — budget allocation, spend tracking, cost breakdown by agent
- **Inbox** — notifications and agent activity feed
- **Settings** — org settings, API keys, team configuration

## Development

```bash
# From monorepo root
pnpm --filter @codeforce/dashboard dev
```

The dashboard dev server runs on `http://localhost:5173` and proxies API requests to the server at `http://localhost:3100`.

## Tech Stack

- [Vite](https://vitejs.dev/) — build tool
- [TanStack Router](https://tanstack.com/router/latest) — file-based routing
- [shadcn/ui](https://ui.shadcn.com) — component library (Tailwind + Radix)
- [Lucide Icons](https://lucide.dev/icons/)
- [TypeScript](https://www.typescriptlang.org/)
