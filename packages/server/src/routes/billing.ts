import { Router } from 'ultimate-express';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { costEvents, budgets, organizations } from '@codeforce/db';

export function billingRouter(db: any) {
  const router = Router();

  router.get('/cost-events', async (req: any, res: any) => {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId query parameter required' });
    }

    const result = await db.select().from(costEvents)
      .where(eq(costEvents.orgId, orgId));
    res.json(result);
  });

  router.get('/budgets', async (req: any, res: any) => {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId query parameter required' });
    }

    const result = await db.select().from(budgets)
      .where(eq(budgets.orgId, orgId));
    res.json(result);
  });

  router.get('/budgets/:id/status', async (req: any, res: any) => {
    const [budget] = await db.select().from(budgets)
      .where(eq(budgets.id, req.params.id));
    if (!budget) return res.status(404).json({ error: 'Not found' });

    const spent = budget.currentSpendCents ?? 0;
    const limit = budget.monthlyLimitCents;
    const remaining = limit - spent;
    const percentUsed = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    res.json({
      budget,
      spent,
      remaining,
      percentUsed,
      overBudget: spent > limit,
    });
  });

  router.get('/org/:orgId/summary', async (req: any, res: any) => {
    const [org] = await db.select().from(organizations)
      .where(eq(organizations.id, req.params.orgId));
    if (!org) return res.status(404).json({ error: 'Not found' });

    const orgBudgets = await db.select().from(budgets)
      .where(eq(budgets.orgId, req.params.orgId));

    const totalLimit = orgBudgets.reduce((sum: number, b: any) => sum + b.monthlyLimitCents, 0);
    const totalSpent = orgBudgets.reduce((sum: number, b: any) => sum + (b.currentSpendCents ?? 0), 0);

    res.json({
      orgId: org.id,
      orgBudgetMonthlyCents: org.budgetMonthlyCents,
      orgSpentMonthlyCents: org.spentMonthlyCents,
      agentBudgetsTotalLimit: totalLimit,
      agentBudgetsTotalSpent: totalSpent,
    });
  });

  return router;
}
