import { z } from 'zod';
import type { buildPlatformTools } from './platform-tools.js';

export interface AutonomousConfig {
  agentId: string;
  orgId: string;
  projectId: string;
  name: string;
  model: string;
  instructions: string;
  tools: ReturnType<typeof buildPlatformTools>;
  prompt: string;
}

export interface AutonomousResult {
  output: string;
  tokensIn: number;
  tokensOut: number;
  costCents: number;
  toolCalls: number;
}

export function buildThreadId(orgId: string, agentId: string, projectId: string): string {
  return `org_${orgId}_agent_${agentId}_project_${projectId}`;
}

export function validateThreadOwnership(threadId: string, orgId: string): void {
  const prefix = `org_${orgId}_`;
  if (!threadId.startsWith(prefix)) {
    throw new Error(`Thread ${threadId} does not belong to org ${orgId}`);
  }
}

export async function executeAutonomous(config: AutonomousConfig): Promise<AutonomousResult> {
  const threadId = buildThreadId(config.orgId, config.agentId, config.projectId);
  validateThreadOwnership(threadId, config.orgId);

  try {
    const { Agent } = await import('@mastra/core/agent');
    const { anthropic } = await import('@ai-sdk/anthropic');

    const toolMap: Record<string, any> = {};
    for (const tool of config.tools) {
      toolMap[tool.id] = tool;
    }

    const agent = new Agent({
      name: config.name,
      instructions: config.instructions,
      model: anthropic(config.model),
      tools: toolMap,
    });

    const response = await agent.generate(config.prompt);

    return {
      output: response.text ?? '',
      tokensIn: response.usage?.promptTokens ?? 0,
      tokensOut: response.usage?.completionTokens ?? 0,
      costCents: 0,
      toolCalls: response.toolResults?.length ?? 0,
    };
  } catch (err) {
    return {
      output: `Error: ${err instanceof Error ? err.message : String(err)}`,
      tokensIn: 0,
      tokensOut: 0,
      costCents: 0,
      toolCalls: 0,
    };
  }
}
