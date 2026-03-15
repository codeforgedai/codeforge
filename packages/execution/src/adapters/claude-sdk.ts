import { query } from '@anthropic-ai/claude-agent-sdk';

export interface ClaudeSdkConfig {
  cwd: string;
  maxTurns: number;
  allowedTools: string[];
  env?: Record<string, string>;
  systemPrompt?: string;
}

export interface ClaudeSdkResult {
  output: string;
  toolResults: any[];
  messages: any[];
}

export async function executeClaudeSdk(
  prompt: string,
  config: ClaudeSdkConfig,
): Promise<ClaudeSdkResult> {
  const collectedMessages: any[] = [];

  for await (const message of query({
    prompt,
    options: {
      allowedTools: config.allowedTools,
      cwd: config.cwd,
      maxTurns: config.maxTurns,
      systemPrompt: config.systemPrompt,
      permissionMode: 'bypassPermissions',
    },
  })) {
    collectedMessages.push(message);
  }

  const resultMessage = collectedMessages.find(
    (m) => m.type === 'result',
  );

  const toolResults = collectedMessages.filter(
    (m) => m.type === 'tool_result',
  );

  const output = resultMessage?.result ?? '';

  return { output, toolResults, messages: collectedMessages };
}
