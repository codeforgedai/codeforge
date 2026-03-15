import { describe, it, expect, vi, beforeEach } from 'vitest';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { extractTokenUsage } from '../adapters/claude-sdk.js';

vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: vi.fn(),
}));

const mockedQuery = vi.mocked(query);

function setupQuery(messages: any[]) {
  mockedQuery.mockReturnValue({
    async *[Symbol.asyncIterator]() {
      for (const m of messages) yield m;
    },
  } as any);
}

describe('extractTokenUsage', () => {
  it('sums input_tokens and output_tokens from multiple messages', () => {
    const messages = [
      { type: 'assistant', usage: { input_tokens: 100, output_tokens: 50 } },
      { type: 'assistant', usage: { input_tokens: 200, output_tokens: 75 } },
      { type: 'tool_result' },
    ];
    const result = extractTokenUsage(messages);
    expect(result).toEqual({ tokensIn: 300, tokensOut: 125 });
  });

  it('returns zeros when no messages have usage', () => {
    const messages = [
      { type: 'tool_result' },
      { type: 'result', result: 'done' },
    ];
    const result = extractTokenUsage(messages);
    expect(result).toEqual({ tokensIn: 0, tokensOut: 0 });
  });

  it('handles empty array', () => {
    const result = extractTokenUsage([]);
    expect(result).toEqual({ tokensIn: 0, tokensOut: 0 });
  });
});

describe('claude-sdk adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports executeClaudeSdk function', async () => {
    const { executeClaudeSdk } = await import('../adapters/claude-sdk.js');
    expect(typeof executeClaudeSdk).toBe('function');
  });

  it('returns structured result from query', async () => {
    setupQuery([
      { type: 'result', result: 'mock output', subtype: 'success' },
    ]);
    const { executeClaudeSdk } = await import('../adapters/claude-sdk.js');

    const result = await executeClaudeSdk('test prompt', {
      cwd: '/tmp',
      maxTurns: 1,
      allowedTools: ['Read', 'Write'],
    });

    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('toolResults');
    expect(result).toHaveProperty('messages');
    expect(Array.isArray(result.toolResults)).toBe(true);
    expect(Array.isArray(result.messages)).toBe(true);
    expect(result.output).toBe('mock output');
  });

  it('includes tokensIn and tokensOut in result', async () => {
    setupQuery([
      { type: 'assistant', usage: { input_tokens: 500, output_tokens: 200 } },
      { type: 'assistant', usage: { input_tokens: 300, output_tokens: 100 } },
      { type: 'result', result: 'done', subtype: 'success' },
    ]);
    const { executeClaudeSdk } = await import('../adapters/claude-sdk.js');

    const result = await executeClaudeSdk('test prompt', {
      cwd: '/tmp',
      maxTurns: 1,
      allowedTools: ['Read', 'Write'],
    });

    expect(result.tokensIn).toBe(800);
    expect(result.tokensOut).toBe(300);
  });
});
