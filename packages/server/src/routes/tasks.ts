import { Router } from 'ultimate-express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { tasks, taskComments, agents } from '@codeforce/db';

const createTaskSchema = z.object({
  orgId: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  projectId: z.string().optional(),
  goalId: z.string().optional(),
  parentId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigneeAgentId: z.string().optional(),
  assigneeUserId: z.string().optional(),
  billingCode: z.string().optional(),
});

const createCommentSchema = z.object({
  body: z.string().min(1),
  authorAgentId: z.string().optional(),
  authorUserId: z.string().optional(),
});

function parseMentions(body: string): string[] {
  const mentionRegex = /@(\w[\w-]*)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(body)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

export function tasksRouter(db: any) {
  const router = Router();

  router.post('/', async (req: any, res: any) => {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const [task] = await db.insert(tasks).values(parsed.data).returning();
    res.status(201).json(task);
  });

  router.get('/', async (req: any, res: any) => {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId query parameter required' });
    }
    const result = await db.select().from(tasks).where(eq(tasks.orgId, orgId));
    res.json(result);
  });

  router.get('/:id', async (req: any, res: any) => {
    const [task] = await db.select().from(tasks)
      .where(eq(tasks.id, req.params.id));
    if (!task) return res.status(404).json({ error: 'Not found' });
    res.json(task);
  });

  router.patch('/:id', async (req: any, res: any) => {
    const [task] = await db.select().from(tasks)
      .where(eq(tasks.id, req.params.id));
    if (!task) return res.status(404).json({ error: 'Not found' });

    const [updated] = await db.update(tasks)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(tasks.id, req.params.id))
      .returning();
    res.json(updated);
  });

  router.post('/:id/comments', async (req: any, res: any) => {
    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [comment] = await db.insert(taskComments).values({
      taskId: req.params.id,
      ...parsed.data,
    }).returning();

    const mentions = parseMentions(parsed.data.body);
    if (mentions.length > 0) {
      const mentionedAgents = await Promise.all(
        mentions.map(async (shortname) => {
          const [task] = await db.select().from(tasks).where(eq(tasks.id, req.params.id));
          if (!task) return null;
          const [agent] = await db.select().from(agents)
            .where(eq(agents.shortname, shortname));
          return agent;
        })
      );
      (comment as any).mentionedAgents = mentionedAgents.filter(Boolean).map((a: any) => a.id);
    }

    res.status(201).json(comment);
  });

  router.get('/:id/comments', async (req: any, res: any) => {
    const result = await db.select().from(taskComments)
      .where(eq(taskComments.taskId, req.params.id));
    res.json(result);
  });

  return router;
}
