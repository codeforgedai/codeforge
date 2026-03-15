import yaml from 'js-yaml';
import { z } from 'zod';

const agentConfigSchema = z.object({
  model: z.string(),
  role: z.string(),
  reports_to: z.string().optional(),
  instructions: z.string().optional(),
  adapter: z.string().optional(),
  tools: z.array(z.string()).default([]),
  max_turns: z.number().optional(),
  budget_monthly_cents: z.number().default(0),
  context_mode: z.enum(['thin', 'fat']).default('thin'),
  permissions: z.object({
    canCreateAgents: z.boolean().optional(),
    canCreateTasks: z.boolean().optional(),
    canApproveHires: z.boolean().optional(),
    canModifyBudgets: z.boolean().optional(),
  }).optional(),
}).passthrough();

const stepConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  config: z.record(z.any()).optional(),
});

const pipelineConfigSchema = z.object({
  name: z.string(),
  steps: z.array(stepConfigSchema),
});

const teamConfigSchema = z.object({
  name: z.string(),
  agents: z.record(agentConfigSchema),
  pipeline: pipelineConfigSchema.optional(),
});

export type ParsedTeamConfig = z.infer<typeof teamConfigSchema>;
export type ParsedAgentConfig = z.infer<typeof agentConfigSchema>;

export function parseTeamConfig(yamlContent: string): ParsedTeamConfig {
  const raw = yaml.load(yamlContent);
  const parsed = teamConfigSchema.parse(raw);
  validateReportsToHierarchy(parsed.agents);
  return parsed;
}

export function validateReportsToHierarchy(agents: Record<string, ParsedAgentConfig>): void {
  const agentNames = new Set(Object.keys(agents));

  for (const [name, agent] of Object.entries(agents)) {
    if (!agent.reports_to) continue;
    if (!agentNames.has(agent.reports_to)) {
      throw new Error(`Agent "${name}" reports_to unknown agent "${agent.reports_to}"`);
    }
  }

  for (const startName of agentNames) {
    const visited = new Set<string>();
    let current: string | undefined = startName;

    while (current) {
      if (visited.has(current)) {
        throw new Error(`Cycle detected in reports_to hierarchy involving "${current}"`);
      }
      visited.add(current);
      current = agents[current]?.reports_to;
    }
  }
}
