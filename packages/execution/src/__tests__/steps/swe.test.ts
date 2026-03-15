import { describe, it, expect, vi } from 'vitest';

vi.mock('../../swe/executor.js', () => ({
  executeSwe: vi.fn(),
}));

import { sweStepFactory } from '../../steps/swe.js';
import { executeSwe } from '../../swe/executor.js';

const mockExecuteSwe = vi.mocked(executeSwe);

describe('sweStepFactory', () => {
  it('returns correct id and description', () => {
    const step = sweStepFactory();
    expect(step.id).toBe('swe');
    expect(step.description).toBe('Executes code changes via Claude Code SDK');
  });

  it('has input and output schemas', () => {
    const step = sweStepFactory();
    expect(step.inputSchema).toBeDefined();
    expect(step.outputSchema).toBeDefined();
  });

  it('execute calls executeSwe with correct config mapping', async () => {
    const step = sweStepFactory();

    mockExecuteSwe.mockResolvedValue({
      filesChanged: ['src/foo.ts'],
      summary: 'Changed foo',
      diffStats: { additions: 10, deletions: 2 },
      prUrl: 'https://github.com/org/repo/pull/1',
      tokensIn: 1000,
      tokensOut: 500,
      costCents: 42,
    });

    const input = {
      plan: 'Add feature X',
      filesToChange: ['src/foo.ts'],
    };

    const context = {
      agentId: 'agent-1',
      orgId: 'org-1',
      projectId: 'proj-1',
      config: {
        taskId: 'task-1',
        workspace: '/tmp/ws',
        githubToken: 'ghp_abc',
        maxTurns: 30,
      },
    };

    const result = await step.execute(input, context);

    expect(mockExecuteSwe).toHaveBeenCalledWith({
      orgId: 'org-1',
      projectId: 'proj-1',
      taskId: 'task-1',
      agentId: 'agent-1',
      plan: 'Add feature X',
      filesToChange: ['src/foo.ts'],
      workspace: '/tmp/ws',
      githubToken: 'ghp_abc',
      maxTurns: 30,
    });

    expect(result).toEqual({
      filesChanged: ['src/foo.ts'],
      summary: 'Changed foo',
      diffStats: { additions: 10, deletions: 2 },
      prUrl: 'https://github.com/org/repo/pull/1',
      costCents: 42,
    });
  });

  it('defaults maxTurns to 50 when not in config', async () => {
    const step = sweStepFactory();

    mockExecuteSwe.mockResolvedValue({
      filesChanged: [],
      summary: 'No changes',
      diffStats: { additions: 0, deletions: 0 },
      prUrl: null,
      tokensIn: 0,
      tokensOut: 0,
      costCents: 0,
    });

    await step.execute(
      { plan: 'Test', filesToChange: [] },
      { agentId: 'a', orgId: 'o', projectId: 'p', config: { taskId: 't', workspace: '/tmp' } },
    );

    expect(mockExecuteSwe).toHaveBeenCalledWith(
      expect.objectContaining({ maxTurns: 50 }),
    );
  });
});
