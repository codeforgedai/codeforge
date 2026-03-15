import { Router } from 'ultimate-express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { approvals } from '@codeforce/db';

const createApprovalSchema = z.object({
  orgId: z.string().min(1),
  type: z.enum(['hire_agent', 'budget_change', 'deploy', 'custom']),
  requestedByAgentId: z.string().optional(),
  requestedByUserId: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  expiresAt: z.string().optional(),
});

const decideApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  decisionNote: z.string().optional(),
  decidedByUserId: z.string().optional(),
});

export function approvalsRouter(db: any) {
  const router = Router();

  router.post('/', async (req: any, res: any) => {
    const parsed = createApprovalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const values: any = { ...parsed.data };
    if (values.expiresAt) {
      values.expiresAt = new Date(values.expiresAt);
    }
    const [approval] = await db.insert(approvals).values(values).returning();
    res.status(201).json(approval);
  });

  router.get('/', async (req: any, res: any) => {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId query parameter required' });
    }
    const result = await db.select().from(approvals).where(eq(approvals.orgId, orgId));
    res.json(result);
  });

  router.get('/:id', async (req: any, res: any) => {
    const [approval] = await db.select().from(approvals)
      .where(eq(approvals.id, req.params.id));
    if (!approval) return res.status(404).json({ error: 'Not found' });
    res.json(approval);
  });

  router.patch('/:id/decide', async (req: any, res: any) => {
    const parsed = decideApprovalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [approval] = await db.select().from(approvals)
      .where(eq(approvals.id, req.params.id));
    if (!approval) return res.status(404).json({ error: 'Not found' });

    if (approval.status !== 'pending') {
      return res.status(422).json({ error: 'Approval already decided' });
    }

    const [updated] = await db.update(approvals)
      .set({
        status: parsed.data.status,
        decisionNote: parsed.data.decisionNote,
        decidedByUserId: parsed.data.decidedByUserId,
        decidedAt: new Date(),
      })
      .where(eq(approvals.id, req.params.id))
      .returning();
    res.json(updated);
  });

  return router;
}
