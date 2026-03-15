import type { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { pipelineConfigs, pipelineRuns, pipelineSteps } from '@codeforce/db';
import { buildWorkflow } from '@codeforce/execution';
import { recordCostEvent, logActivity, type ExecutionContext } from '../executor.js';

export interface PipelineJobData {
  pipelineConfigId: string;
  taskId: string;
  orgId: string;
}

export function createPipelineProcessor(db: any) {
  return async (job: Job<PipelineJobData>) => {
    const { pipelineConfigId, taskId, orgId } = job.data;

    const [config] = await db.select().from(pipelineConfigs)
      .where(eq(pipelineConfigs.id, pipelineConfigId));

    if (!config) {
      throw new Error(`Pipeline config ${pipelineConfigId} not found`);
    }

    const stepGraph = config.serializedStepGraph as any;
    const steps = Array.isArray(stepGraph?.steps) ? stepGraph.steps : [];

    const workflow = buildWorkflow({
      name: config.name,
      orgId,
      projectId: 'default',
      steps: steps.map((s: any) => ({
        stepType: s.stepType ?? 'code',
        agentId: s.agentId ?? 'unknown',
        config: s.config ?? {},
      })),
    });

    const [run] = await db.insert(pipelineRuns).values({
      taskId,
      pipelineConfigId,
      status: 'running',
      startedAt: new Date(),
    }).returning();

    for (let i = 0; i < steps.length; i++) {
      await db.insert(pipelineSteps).values({
        pipelineRunId: run.id,
        stepId: steps[i].id ?? `step-${i}`,
        agentId: steps[i].agentId,
        status: 'pending',
        order: i,
      });
    }

    try {
      const result = await workflow.run({ taskId });

      let totalCost = 0;
      for (const stepResult of result.steps) {
        const stepCost = stepResult.output?.costCents ?? 0;
        totalCost += stepCost;

        await db.update(pipelineSteps)
          .set({
            status: stepResult.error ? 'error' : 'completed',
            outputJson: stepResult.output,
            costCents: stepCost,
            finishedAt: new Date(),
            error: stepResult.error,
          })
          .where(eq(pipelineSteps.stepId, stepResult.stepId));
      }

      const finalStatus = result.success ? 'completed' : 'failed';

      if (result.steps.some(s => s.output?.verdict === 'changes_requested')) {
        await db.update(pipelineRuns)
          .set({ status: 'changes_requested', totalCostCents: totalCost, finishedAt: new Date() })
          .where(eq(pipelineRuns.id, run.id));

        return { status: 'changes_requested', runId: run.id };
      }

      await db.update(pipelineRuns)
        .set({ status: finalStatus, totalCostCents: totalCost, finishedAt: new Date() })
        .where(eq(pipelineRuns.id, run.id));

      return { status: finalStatus, runId: run.id };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      await db.update(pipelineRuns)
        .set({ status: 'failed', finishedAt: new Date() })
        .where(eq(pipelineRuns.id, run.id));

      return { status: 'error', error: errorMsg };
    }
  };
}
