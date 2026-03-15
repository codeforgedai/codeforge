import { Router } from 'ultimate-express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { pipelineConfigs, pipelineRuns, pipelineSteps } from '@codeforce/db';

const triggerPipelineSchema = z.object({
  pipelineConfigId: z.string().min(1),
  taskId: z.string().min(1),
  orgId: z.string().min(1),
});

export function pipelinesRouter(db: any) {
  const router = Router();

  router.post('/run', async (req: any, res: any) => {
    const parsed = triggerPipelineSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [config] = await db.select().from(pipelineConfigs)
      .where(eq(pipelineConfigs.id, parsed.data.pipelineConfigId));

    if (!config) {
      return res.status(404).json({ error: 'Pipeline config not found' });
    }

    const [run] = await db.insert(pipelineRuns).values({
      taskId: parsed.data.taskId,
      pipelineConfigId: parsed.data.pipelineConfigId,
      status: 'queued',
    }).returning();

    // In production, this would enqueue a BullMQ job:
    // await pipelineQueue.add('pipeline', parsed.data);

    res.status(201).json({ runId: run.id, status: 'queued' });
  });

  router.get('/:id', async (req: any, res: any) => {
    const [config] = await db.select().from(pipelineConfigs)
      .where(eq(pipelineConfigs.id, req.params.id));
    if (!config) return res.status(404).json({ error: 'Not found' });
    res.json(config);
  });

  router.get('/runs/:runId', async (req: any, res: any) => {
    const [run] = await db.select().from(pipelineRuns)
      .where(eq(pipelineRuns.id, req.params.runId));
    if (!run) return res.status(404).json({ error: 'Not found' });

    const steps = await db.select().from(pipelineSteps)
      .where(eq(pipelineSteps.pipelineRunId, req.params.runId));

    res.json({ ...run, steps });
  });

  return router;
}
