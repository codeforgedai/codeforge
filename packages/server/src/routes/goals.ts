import { Router } from 'ultimate-express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { goals } from '@codeforce/db';

const createGoalSchema = z.object({
  orgId: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  level: z.enum(['outcome', 'objective', 'task']).optional(),
  parentId: z.string().optional(),
  ownerAgentId: z.string().optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  level: z.enum(['outcome', 'objective', 'task']).optional(),
  parentId: z.string().nullable().optional(),
  ownerAgentId: z.string().nullable().optional(),
});

export function goalsRouter(db: any) {
  const router = Router();

  router.post('/', async (req: any, res: any) => {
    const parsed = createGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const [goal] = await db.insert(goals).values(parsed.data).returning();
    res.status(201).json(goal);
  });

  router.get('/', async (req: any, res: any) => {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId query parameter required' });
    }
    const result = await db.select().from(goals).where(eq(goals.orgId, orgId));
    res.json(result);
  });

  router.get('/:id', async (req: any, res: any) => {
    const [goal] = await db.select().from(goals)
      .where(eq(goals.id, req.params.id));
    if (!goal) return res.status(404).json({ error: 'Not found' });
    res.json(goal);
  });

  router.patch('/:id', async (req: any, res: any) => {
    const parsed = updateGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [goal] = await db.select().from(goals)
      .where(eq(goals.id, req.params.id));
    if (!goal) return res.status(404).json({ error: 'Not found' });

    const [updated] = await db.update(goals)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(goals.id, req.params.id))
      .returning();
    res.json(updated);
  });

  router.get('/:id/children', async (req: any, res: any) => {
    const children = await db.select().from(goals)
      .where(eq(goals.parentId, req.params.id));
    res.json(children);
  });

  return router;
}
