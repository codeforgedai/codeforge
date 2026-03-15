import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockHasUncommittedChanges,
  mockHasUnpushedCommits,
  mockGetCurrentBranch,
  mockCheckoutBranch,
  mockConfigUser,
  mockCommitAll,
  mockPush,
  mockCreateGitHubPr,
  mockGetDefaultBranch,
} = vi.hoisted(() => ({
  mockHasUncommittedChanges: vi.fn(),
  mockHasUnpushedCommits: vi.fn(),
  mockGetCurrentBranch: vi.fn(),
  mockCheckoutBranch: vi.fn(),
  mockConfigUser: vi.fn(),
  mockCommitAll: vi.fn(),
  mockPush: vi.fn(),
  mockCreateGitHubPr: vi.fn(),
  mockGetDefaultBranch: vi.fn(),
}));

vi.mock('../../swe/git.js', () => ({
  hasUncommittedChanges: mockHasUncommittedChanges,
  hasUnpushedCommits: mockHasUnpushedCommits,
  getCurrentBranch: mockGetCurrentBranch,
  checkoutBranch: mockCheckoutBranch,
  configUser: mockConfigUser,
  commitAll: mockCommitAll,
  push: mockPush,
  createGitHubPr: mockCreateGitHubPr,
  getDefaultBranch: mockGetDefaultBranch,
}));

import { safetyNetPr } from '../../middleware/safety-net-pr.js';

const baseParams = {
  cwd: '/repo',
  taskId: 'task-42',
  repoOwner: 'acme',
  repoName: 'widgets',
  githubToken: 'ghp_test',
};

beforeEach(() => {
  vi.resetAllMocks();
  mockGetCurrentBranch.mockResolvedValue('codeforce/task-42');
  mockGetDefaultBranch.mockResolvedValue('main');
  mockCreateGitHubPr.mockResolvedValue({ html_url: 'https://github.com/acme/widgets/pull/1', number: 1 });
});

describe('safetyNetPr', () => {
  it('returns null when no uncommitted or unpushed changes', async () => {
    mockHasUncommittedChanges.mockResolvedValue(false);
    mockHasUnpushedCommits.mockResolvedValue(false);

    const result = await safetyNetPr(baseParams);

    expect(result).toBeNull();
    expect(mockCommitAll).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('commits, pushes, and creates PR when uncommitted changes exist', async () => {
    mockHasUncommittedChanges.mockResolvedValue(true);
    mockHasUnpushedCommits.mockResolvedValue(false);

    const result = await safetyNetPr(baseParams);

    expect(mockConfigUser).toHaveBeenCalledWith('/repo', 'codeforce[bot]', 'bot@codeforce.dev');
    expect(mockCommitAll).toHaveBeenCalledWith('/repo', 'chore: auto-commit from codeforce swe step');
    expect(mockPush).toHaveBeenCalledWith('/repo', 'codeforce/task-42', 'ghp_test');
    expect(mockGetDefaultBranch).toHaveBeenCalledWith('acme', 'widgets', 'ghp_test');
    expect(mockCreateGitHubPr).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'acme',
        repo: 'widgets',
        head: 'codeforce/task-42',
        base: 'main',
        token: 'ghp_test',
      }),
    );
    expect(result).toBe('https://github.com/acme/widgets/pull/1');
  });

  it('checks out correct branch if not already on it', async () => {
    mockHasUncommittedChanges.mockResolvedValue(true);
    mockHasUnpushedCommits.mockResolvedValue(false);
    mockGetCurrentBranch.mockResolvedValue('some-other-branch');

    await safetyNetPr(baseParams);

    expect(mockCheckoutBranch).toHaveBeenCalledWith('/repo', 'codeforce/task-42');
    expect(mockCommitAll).toHaveBeenCalled();
  });

  it('pushes without committing when only unpushed commits exist', async () => {
    mockHasUncommittedChanges.mockResolvedValue(false);
    mockHasUnpushedCommits.mockResolvedValue(true);

    const result = await safetyNetPr(baseParams);

    expect(mockCommitAll).not.toHaveBeenCalled();
    expect(mockConfigUser).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/repo', 'codeforce/task-42', 'ghp_test');
    expect(mockCreateGitHubPr).toHaveBeenCalled();
    expect(result).toBe('https://github.com/acme/widgets/pull/1');
  });
});
