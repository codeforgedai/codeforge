import { eq, and, sql } from 'drizzle-orm';
import { agents, budgets, costEvents, activityLog } from '@codeforce/db';

export interface ExecutionContext {
  db: any;
  orgId: string;
  agentId: string;
}

export async function checkBudget(ctx: ExecutionContext): Promise<{ allowed: boolean; remaining: number }> {
  const [agent] = await ctx.db.select({
    budgetMonthlyCents: agents.budgetMonthlyCents,
    spentMonthlyCents: agents.spentMonthlyCents,
  }).from(agents).where(eq(agents.id, ctx.agentId));

  if (!agent) {
    return { allowed: false, remaining: 0 };
  }

  const limit = agent.budgetMonthlyCents ?? 0;
  const spent = agent.spentMonthlyCents ?? 0;

  if (limit <= 0) {
    return { allowed: true, remaining: Infinity };
  }

  const remaining = limit - spent;
  return { allowed: remaining > 0, remaining };
}

export async function recordCostEvent(ctx: ExecutionContext, cost: {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
  taskId?: string;
}) {
  await ctx.db.insert(costEvents).values({
    orgId: ctx.orgId,
    agentId: ctx.agentId,
    taskId: cost.taskId,
    provider: cost.provider,
    model: cost.model,
    inputTokens: cost.inputTokens,
    outputTokens: cost.outputTokens,
    costCents: cost.costCents,
  });

  await ctx.db.update(agents)
    .set({
      spentMonthlyCents: sql`${agents.spentMonthlyCents} + ${cost.costCents}`,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, ctx.agentId));
}

export async function logActivity(ctx: ExecutionContext, action: string, details: Record<string, any>) {
  await ctx.db.insert(activityLog).values({
    orgId: ctx.orgId,
    actorType: 'agent',
    actorId: ctx.agentId,
    action,
    entityType: 'agent',
    entityId: ctx.agentId,
    details,
  });
}
