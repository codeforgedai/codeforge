import { describe, it, expect, vi } from 'vitest';
import { executeClaudeSdk } from '../adapters/claude-sdk.js';

vi.mock('node:child_process', () => ({
  execFile: vi.fn((_cmd: string, _args: string[], _opts: any, cb?: any) => {
    if (typeof cb === 'function') {
      cb(new Error('mock: claude not found'), '', '');
    }
    return { on: vi.fn(), stdout: { on: vi.fn() }, stderr: { on: vi.fn() } };
  }),
}));

describe('claude-sdk adapter', () => {
  it('exports executeClaudeSdk function', () => {
    expect(typeof executeClaudeSdk).toBe('function');
  });

  it('returns structured result on failure', async () => {
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
    expect(result.output).toContain('Error');
  });
});
