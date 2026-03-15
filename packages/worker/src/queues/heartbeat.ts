import type { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { agents, agentRuntimeState, heartbeatRuns } from '@codeforce/db';
import { buildPlatformTools } from '@codeforce/execution';
import { checkBudget, recordCostEvent, logActivity, type ExecutionContext } from '../executor.js';

export interface HeartbeatJobData {
  agentId: string;
  orgId: string;
  wakeupRequestId?: string;
}

export function createHeartbeatProcessor(db: any) {
  return async (job: Job<HeartbeatJobData>) => {
    const { agentId, orgId } = job.data;
    const ctx: ExecutionContext = { db, orgId, agentId };

    const budget = await checkBudget(ctx);
    if (!budget.allowed) {
      await logActivity(ctx, 'heartbeat_budget_exceeded', { remaining: budget.remaining });
      return { status: 'budget_exceeded' };
    }

    await db.update(agents)
      .set({ status: 'running', updatedAt: new Date() })
      .where(eq(agents.id, agentId));

    const [run] = await db.insert(heartbeatRuns).values({
      agentId,
      orgId,
      invocationSource: 'heartbeat',
      triggerDetail: job.data.wakeupRequestId,
      status: 'running',
      startedAt: new Date(),
    }).returning();

    try {
      const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      const { executeAutonomous } = await import('@codeforce/execution');
      const result = await executeAutonomous({
        agentId,
        orgId,
        projectId: 'default',
        name: agent.name,
        model: agent.model,
        instructions: agent.instructions ?? '',
        tools: buildPlatformTools({ db, orgId }),
        prompt: 'Heartbeat check: review current state and take any needed actions.',
      });

      await db.update(heartbeatRuns)
        .set({
          status: 'completed',
          finishedAt: new Date(),
          resultJson: { output: result.output, toolCalls: result.toolCalls },
          usageJson: { tokensIn: result.tokensIn, tokensOut: result.tokensOut },
        })
        .where(eq(heartbeatRuns.id, run.id));

      await db.update(agentRuntimeState)
        .set({
          lastRunId: run.id,
          lastRunStatus: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(agentRuntimeState.agentId, agentId));

      if (result.costCents > 0) {
        await recordCostEvent(ctx, {
          provider: 'anthropic',
          model: agent.model,
          inputTokens: result.tokensIn,
          outputTokens: result.tokensOut,
          costCents: result.costCents,
        });
      }

      await db.update(agents)
        .set({ status: 'idle', lastHeartbeatAt: new Date(), updatedAt: new Date() })
        .where(eq(agents.id, agentId));

      await logActivity(ctx, 'heartbeat_completed', {
        runId: run.id,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
      });

      return { status: 'completed', runId: run.id };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      await db.update(heartbeatRuns)
        .set({ status: 'error', finishedAt: new Date(), errorCode: errorMsg })
        .where(eq(heartbeatRuns.id, run.id));

      await db.update(agents)
        .set({ status: 'error', updatedAt: new Date() })
        .where(eq(agents.id, agentId));

      await logActivity(ctx, 'heartbeat_error', { runId: run.id, error: errorMsg });

      return { status: 'error', error: errorMsg };
    }
  };
}
