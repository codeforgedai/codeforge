import { z } from 'zod';
import type { StepFactory, StepContext } from '../step-registry.js';
import { executeSwe } from '../swe/executor.js';

const sweInputSchema = z.object({
  plan: z.string(),
  filesToChange: z.array(z.string()),
});

const sweOutputSchema = z.object({
  filesChanged: z.array(z.string()),
  summary: z.string(),
  diffStats: z.object({
    additions: z.number(),
    deletions: z.number(),
  }).optional(),
  prUrl: z.string().nullable(),
  costCents: z.number().optional(),
});

export function sweStepFactory(): StepFactory {
  return {
    id: 'swe',
    description: 'Executes code changes via Claude Code SDK',
    inputSchema: sweInputSchema,
    outputSchema: sweOutputSchema,
    execute: async (input, context) => {
      const result = await executeSwe({
        orgId: context.orgId,
        projectId: context.projectId,
        taskId: context.config.taskId,
        agentId: context.agentId,
        plan: input.plan,
        filesToChange: input.filesToChange,
        workspace: context.config.workspace,
        githubToken: context.config.githubToken,
        maxTurns: context.config.maxTurns ?? 50,
      });
      return {
        filesChanged: result.filesChanged,
        summary: result.summary,
        diffStats: result.diffStats,
        prUrl: result.prUrl,
        costCents: result.costCents,
      };
    },
  };
}
