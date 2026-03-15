import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WorkspaceConfig } from '../../swe/workspace.js';

vi.mock('../../swe/workspace.js', () => ({
  setupWorkspace: vi.fn(),
  readRepoRules: vi.fn(),
}));

vi.mock('../../swe/prompt.js', () => ({
  constructSwePrompt: vi.fn(),
}));

vi.mock('../../adapters/claude-sdk.js', () => ({
  executeClaudeSdk: vi.fn(),
}));

vi.mock('../../middleware/completion-guard.js', () => ({
  ensureCompletion: vi.fn(),
}));

vi.mock('../../middleware/safety-net-pr.js', () => ({
  safetyNetPr: vi.fn(),
}));

vi.mock('../../swe/git.js', () => ({
  getDiffStats: vi.fn(),
  getChangedFiles: vi.fn(),
}));

import { executeSwe, type SweExecutionConfig } from '../../swe/executor.js';
import { setupWorkspace, readRepoRules } from '../../swe/workspace.js';
import { constructSwePrompt } from '../../swe/prompt.js';
import { executeClaudeSdk } from '../../adapters/claude-sdk.js';
import { ensureCompletion } from '../../middleware/completion-guard.js';
import { safetyNetPr } from '../../middleware/safety-net-pr.js';
import { getDiffStats, getChangedFiles } from '../../swe/git.js';

const baseConfig: SweExecutionConfig = {
  orgId: 'org-1',
  projectId: 'proj-1',
  taskId: 'task-123',
  agentId: 'agent-1',
  plan: 'Add login endpoint',
  filesToChange: ['src/auth.ts'],
  workspace: {
    repoUrl: 'https://github.com/acme/app.git',
    repoOwner: 'acme',
    repoName: 'app',
  },
  githubToken: 'ghp_test',
};

const mockSdkResult = {
  output: 'Implemented login endpoint',
  toolResults: [],
  messages: [],
  tokensIn: 1000,
  tokensOut: 500,
};

describe('executeSwe', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(setupWorkspace).mockResolvedValue('/tmp/workspace/app');
    vi.mocked(readRepoRules).mockResolvedValue('Use ESM');
    vi.mocked(constructSwePrompt).mockReturnValue('system prompt');
    vi.mocked(executeClaudeSdk).mockResolvedValue(mockSdkResult);
    vi.mocked(ensureCompletion).mockResolvedValue(mockSdkResult);
    vi.mocked(safetyNetPr).mockResolvedValue('https://github.com/acme/app/pull/42');
    vi.mocked(getDiffStats).mockResolvedValue({ additions: 10, deletions: 3 });
    vi.mocked(getChangedFiles).mockResolvedValue(['src/auth.ts']);
  });

  it('orchestrates full flow and returns correct shape', async () => {
    const result = await executeSwe(baseConfig);

    expect(setupWorkspace).toHaveBeenCalledWith(
      baseConfig.workspace,
      'task-123',
      'ghp_test',
    );
    expect(readRepoRules).toHaveBeenCalledWith('/tmp/workspace/app');
    expect(constructSwePrompt).toHaveBeenCalledWith({
      cwd: '/tmp/workspace/app',
      plan: 'Add login endpoint',
      filesToChange: ['src/auth.ts'],
      taskId: 'task-123',
      repoRules: 'Use ESM',
    });
    expect(executeClaudeSdk).toHaveBeenCalledWith(
      'Implement the following plan:\n\nAdd login endpoint',
      {
        cwd: '/tmp/workspace/app',
        maxTurns: 50,
        allowedTools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep'],
        systemPrompt: 'system prompt',
      },
    );
    expect(ensureCompletion).toHaveBeenCalledWith(
      '/tmp/workspace/app',
      mockSdkResult,
      expect.any(Function),
    );
    expect(safetyNetPr).toHaveBeenCalledWith({
      cwd: '/tmp/workspace/app',
      taskId: 'task-123',
      repoOwner: 'acme',
      repoName: 'app',
      githubToken: 'ghp_test',
    });
    expect(getDiffStats).toHaveBeenCalledWith('/tmp/workspace/app');
    expect(getChangedFiles).toHaveBeenCalledWith('/tmp/workspace/app');

    expect(result).toEqual({
      filesChanged: ['src/auth.ts'],
      summary: 'Implemented login endpoint',
      prUrl: 'https://github.com/acme/app/pull/42',
      diffStats: { additions: 10, deletions: 3 },
      tokensIn: 1000,
      tokensOut: 500,
      costCents: 0,
    });
  });

  it('runs safety net PR even when SDK throws and re-throws error', async () => {
    const sdkError = new Error('SDK crashed');
    vi.mocked(executeClaudeSdk).mockRejectedValue(sdkError);

    await expect(executeSwe(baseConfig)).rejects.toThrow('SDK crashed');

    expect(safetyNetPr).toHaveBeenCalledWith({
      cwd: '/tmp/workspace/app',
      taskId: 'task-123',
      repoOwner: 'acme',
      repoName: 'app',
      githubToken: 'ghp_test',
    });
  });

  it('passes maxTurns to Claude SDK config', async () => {
    await executeSwe({ ...baseConfig, maxTurns: 25 });

    expect(executeClaudeSdk).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ maxTurns: 25 }),
    );
  });
});
