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
  tokensIn: number;
  tokensOut: number;
}

export function extractTokenUsage(messages: any[]): { tokensIn: number; tokensOut: number } {
  let tokensIn = 0;
  let tokensOut = 0;
  for (const m of messages) {
    if (!m.usage) continue;
    tokensIn += m.usage.input_tokens ?? 0;
    tokensOut += m.usage.output_tokens ?? 0;
  }
  return { tokensIn, tokensOut };
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
  const { tokensIn, tokensOut } = extractTokenUsage(collectedMessages);

  return { output, toolResults, messages: collectedMessages, tokensIn, tokensOut };
}
