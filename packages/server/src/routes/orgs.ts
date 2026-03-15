import { Router } from 'ultimate-express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { organizations } from '@codeforce/db';

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
});

export function orgsRouter(db: any) {
  const router = Router();

  router.post('/', async (req: any, res: any) => {
    const parsed = createOrgSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const [org] = await db.insert(organizations).values({
      name: parsed.data.name,
    }).returning();
    res.status(201).json(org);
  });

  router.get('/', async (req: any, res: any) => {
    const orgs = await db.select().from(organizations);
    res.json(orgs);
  });

  router.get('/:id', async (req: any, res: any) => {
    const [org] = await db.select().from(organizations)
      .where(eq(organizations.id, req.params.id));
    if (!org) return res.status(404).json({ error: 'Not found' });
    res.json(org);
  });

  return router;
}
