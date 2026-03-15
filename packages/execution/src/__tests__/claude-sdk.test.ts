import { describe, it, expect, vi } from 'vitest';

vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: vi.fn(() => ({
    async *[Symbol.asyncIterator]() {
      yield { type: 'result', result: 'mock output', subtype: 'success' };
    },
  })),
}));

describe('claude-sdk adapter', () => {
  it('exports executeClaudeSdk function', async () => {
    const { executeClaudeSdk } = await import('../adapters/claude-sdk.js');
    expect(typeof executeClaudeSdk).toBe('function');
  });

  it('returns structured result from query', async () => {
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
});
