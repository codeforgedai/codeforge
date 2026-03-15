import { Router } from 'ultimate-express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { projects, projectWorkspaces, projectDocs } from '@codeforce/db';

const createProjectSchema = z.object({
  orgId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  goalId: z.string().optional(),
  leadAgentId: z.string().optional(),
  targetDate: z.string().optional(),
  color: z.string().optional(),
});

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  cwd: z.string().optional(),
  repoUrl: z.string().optional(),
  repoRef: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

const createDocSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  docType: z.enum(['spec', 'prd', 'architecture', 'guide', 'other']).optional(),
  createdByType: z.string().optional(),
  createdById: z.string().optional(),
});

export function projectsRouter(db: any) {
  const router = Router();

  router.post('/', async (req: any, res: any) => {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const values: any = { ...parsed.data };
    if (values.targetDate) {
      values.targetDate = new Date(values.targetDate);
    }
    const [project] = await db.insert(projects).values(values).returning();
    res.status(201).json(project);
  });

  router.get('/', async (req: any, res: any) => {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId query parameter required' });
    }
    const result = await db.select().from(projects).where(eq(projects.orgId, orgId));
    res.json(result);
  });

  router.get('/:id', async (req: any, res: any) => {
    const [project] = await db.select().from(projects)
      .where(eq(projects.id, req.params.id));
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  });

  router.patch('/:id', async (req: any, res: any) => {
    const [project] = await db.select().from(projects)
      .where(eq(projects.id, req.params.id));
    if (!project) return res.status(404).json({ error: 'Not found' });

    const [updated] = await db.update(projects)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(projects.id, req.params.id))
      .returning();
    res.json(updated);
  });

  // Workspaces
  router.post('/:id/workspaces', async (req: any, res: any) => {
    const parsed = createWorkspaceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const [ws] = await db.insert(projectWorkspaces).values({
      projectId: req.params.id,
      ...parsed.data,
    }).returning();
    res.status(201).json(ws);
  });

  router.get('/:id/workspaces', async (req: any, res: any) => {
    const result = await db.select().from(projectWorkspaces)
      .where(eq(projectWorkspaces.projectId, req.params.id));
    res.json(result);
  });

  // Docs
  router.post('/:id/docs', async (req: any, res: any) => {
    const parsed = createDocSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const [doc] = await db.insert(projectDocs).values({
      projectId: req.params.id,
      ...parsed.data,
    }).returning();
    res.status(201).json(doc);
  });

  router.get('/:id/docs', async (req: any, res: any) => {
    const result = await db.select().from(projectDocs)
      .where(eq(projectDocs.projectId, req.params.id));
    res.json(result);
  });

  return router;
}
