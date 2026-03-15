import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockHasUncommittedChanges } = vi.hoisted(() => ({
  mockHasUncommittedChanges: vi.fn<(cwd: string) => Promise<boolean>>(),
}));

vi.mock('../../swe/git.js', () => ({
  hasUncommittedChanges: mockHasUncommittedChanges,
}));

import { ensureCompletion } from '../../middleware/completion-guard.js';
import type { ClaudeSdkResult } from '../../adapters/claude-sdk.js';

function makeResult(output: string): ClaudeSdkResult {
  return { output, toolResults: [], messages: [], tokensIn: 0, tokensOut: 0 };
}

beforeEach(() => {
  mockHasUncommittedChanges.mockReset();
});

describe('ensureCompletion', () => {
  it('returns result immediately if hasUncommittedChanges returns true', async () => {
    mockHasUncommittedChanges.mockResolvedValue(true);
    const result = makeResult('done');
    const retryFn = vi.fn();

    const out = await ensureCompletion('/repo', result, retryFn);

    expect(out).toBe(result);
    expect(retryFn).not.toHaveBeenCalled();
  });

  it('retries when no changes detected then succeeds', async () => {
    mockHasUncommittedChanges
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const initial = makeResult('initial');
    const retried = makeResult('retried');
    const retryFn = vi.fn().mockResolvedValue(retried);

    const out = await ensureCompletion('/repo', initial, retryFn);

    expect(retryFn).toHaveBeenCalledTimes(1);
    expect(retryFn).toHaveBeenCalledWith(expect.stringContaining('did not make any code changes'));
    expect(out).toBe(retried);
  });

  it('gives up after maxRetries when no changes ever appear', async () => {
    mockHasUncommittedChanges.mockResolvedValue(false);

    const initial = makeResult('initial');
    const retried = makeResult('last-retry');
    const retryFn = vi.fn().mockResolvedValue(retried);

    const out = await ensureCompletion('/repo', initial, retryFn, 3);

    expect(retryFn).toHaveBeenCalledTimes(3);
    expect(out).toBe(retried);
  });

  it('stops retrying early if changes appear', async () => {
    mockHasUncommittedChanges
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const initial = makeResult('initial');
    const retry1 = makeResult('retry1');
    const retry2 = makeResult('retry2');
    const retryFn = vi.fn()
      .mockResolvedValueOnce(retry1)
      .mockResolvedValueOnce(retry2);

    const out = await ensureCompletion('/repo', initial, retryFn, 5);

    expect(retryFn).toHaveBeenCalledTimes(2);
    expect(out).toBe(retry2);
  });
});
