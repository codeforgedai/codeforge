import { Router } from 'ultimate-express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { agents, agentConfigRevisions } from '@codeforce/db';
import { isValidTransition, agentStatusTransitions } from '@codeforce/shared';

const createAgentSchema = z.object({
  orgId: z.string().min(1),
  name: z.string().min(1).max(100),
  shortname: z.string().min(1).max(50),
  role: z.string().min(1),
  adapterType: z.string().optional(),
  model: z.string().optional(),
  instructions: z.string().optional(),
  contextMode: z.string().optional(),
  reportsTo: z.string().optional(),
});

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.string().min(1).optional(),
  instructions: z.string().optional(),
  model: z.string().optional(),
  adapterConfig: z.record(z.unknown()).optional(),
  runtimeConfig: z.record(z.unknown()).optional(),
  tools: z.array(z.unknown()).optional(),
  contextMode: z.string().optional(),
  budgetMonthlyCents: z.number().optional(),
  reportsTo: z.string().nullable().optional(),
});

const statusUpdateSchema = z.object({
  status: z.string().min(1),
});

export function agentsRouter(db: any) {
  const router = Router();

  router.post('/', async (req: any, res: any) => {
    const parsed = createAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    let shortname = parsed.data.shortname;
    const existing = await db.select({ id: agents.id }).from(agents)
      .where(and(eq(agents.orgId, parsed.data.orgId), eq(agents.shortname, shortname)));

    if (existing.length > 0) {
      shortname = `${shortname}-${Date.now()}`;
    }

    const [agent] = await db.insert(agents).values({
      ...parsed.data,
      shortname,
      status: 'pending_approval',
    }).returning();
    res.status(201).json(agent);
  });

  router.get('/', async (req: any, res: any) => {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId query parameter required' });
    }
    const result = await db.select().from(agents).where(eq(agents.orgId, orgId));
    res.json(result);
  });

  router.get('/:id', async (req: any, res: any) => {
    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, req.params.id));
    if (!agent) return res.status(404).json({ error: 'Not found' });
    res.json(agent);
  });

  router.patch('/:id/status', async (req: any, res: any) => {
    const parsed = statusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, req.params.id));
    if (!agent) return res.status(404).json({ error: 'Not found' });

    if (!isValidTransition(agentStatusTransitions, agent.status, parsed.data.status)) {
      return res.status(422).json({
        error: `Invalid transition from '${agent.status}' to '${parsed.data.status}'`,
      });
    }

    const [updated] = await db.update(agents)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(agents.id, req.params.id))
      .returning();
    res.json(updated);
  });

  router.patch('/:id', async (req: any, res: any) => {
    const parsed = updateAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [agent] = await db.select().from(agents)
      .where(eq(agents.id, req.params.id));
    if (!agent) return res.status(404).json({ error: 'Not found' });

    const changedKeys = Object.keys(parsed.data);
    const beforeConfig: Record<string, unknown> = {};
    const afterConfig: Record<string, unknown> = {};
    for (const key of changedKeys) {
      beforeConfig[key] = (agent as any)[key];
      afterConfig[key] = (parsed.data as any)[key];
    }

    const [updated] = await db.update(agents)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(agents.id, req.params.id))
      .returning();

    await db.insert(agentConfigRevisions).values({
      agentId: req.params.id,
      changedKeys,
      beforeConfig,
      afterConfig,
    });

    res.json(updated);
  });

  return router;
}
