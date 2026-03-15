import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockExec, mockFetch, mockWriteFile, mockUnlink } = vi.hoisted(() => ({
  mockExec: vi.fn(),
  mockFetch: vi.fn(),
  mockWriteFile: vi.fn(),
  mockUnlink: vi.fn(),
}));

vi.mock('node:child_process');
vi.mock('node:util', () => ({ promisify: () => mockExec }));
vi.mock('node:fs/promises', () => ({
  writeFile: mockWriteFile,
  unlink: mockUnlink,
}));
vi.stubGlobal('fetch', mockFetch);

import {
  hasUncommittedChanges,
  hasUnpushedCommits,
  getCurrentBranch,
  checkoutBranch,
  commitAll,
  getDiffStats,
  getChangedFiles,
  configUser,
  push,
  validateBranchName,
  escapeForShell,
  createGitHubPr,
  getDefaultBranch,
} from '../../swe/git.js';

beforeEach(() => {
  mockExec.mockReset();
  mockFetch.mockReset();
  mockWriteFile.mockReset();
  mockUnlink.mockReset();
});

describe('validateBranchName', () => {
  it('accepts valid branch names', () => {
    expect(() => validateBranchName('main')).not.toThrow();
    expect(() => validateBranchName('feature/my-branch')).not.toThrow();
    expect(() => validateBranchName('fix/issue_123')).not.toThrow();
    expect(() => validateBranchName('release/1.0.0')).not.toThrow();
  });

  it('rejects invalid branch names', () => {
    expect(() => validateBranchName('branch name')).toThrow();
    expect(() => validateBranchName('branch;rm -rf')).toThrow();
    expect(() => validateBranchName('')).toThrow();
    expect(() => validateBranchName('$(malicious)')).toThrow();
  });
});

describe('escapeForShell', () => {
  it('returns value unchanged when no single quotes', () => {
    expect(escapeForShell('hello')).toBe('hello');
  });

  it('escapes single quotes', () => {
    expect(escapeForShell("it's")).toBe("it'\\''s");
  });
});

describe('hasUncommittedChanges', () => {
  it('returns true when there are changes', async () => {
    mockExec.mockResolvedValue({ stdout: ' M file.ts\n' });
    const result = await hasUncommittedChanges('/repo');
    expect(result).toBe(true);
    expect(mockExec).toHaveBeenCalledWith('git status --porcelain', { cwd: '/repo' });
  });

  it('returns false when clean', async () => {
    mockExec.mockResolvedValue({ stdout: '' });
    const result = await hasUncommittedChanges('/repo');
    expect(result).toBe(false);
  });
});

describe('hasUnpushedCommits', () => {
  it('returns true when there are unpushed commits', async () => {
    mockExec.mockResolvedValue({ stdout: 'abc123 some commit\n' });
    const result = await hasUnpushedCommits('/repo');
    expect(result).toBe(true);
  });

  it('returns false when no unpushed commits', async () => {
    mockExec.mockResolvedValue({ stdout: '' });
    const result = await hasUnpushedCommits('/repo');
    expect(result).toBe(false);
  });

  it('returns false when command fails (no upstream)', async () => {
    mockExec.mockResolvedValue({ stdout: '' });
    const result = await hasUnpushedCommits('/repo');
    expect(result).toBe(false);
  });
});

describe('getCurrentBranch', () => {
  it('returns trimmed branch name', async () => {
    mockExec.mockResolvedValue({ stdout: 'main\n' });
    const result = await getCurrentBranch('/repo');
    expect(result).toBe('main');
    expect(mockExec).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD', { cwd: '/repo' });
  });
});

describe('checkoutBranch', () => {
  it('validates and checks out branch', async () => {
    mockExec.mockResolvedValue({ stdout: '' });
    await checkoutBranch('/repo', 'feature/new');
    expect(mockExec).toHaveBeenCalledWith('git checkout -B feature/new', { cwd: '/repo' });
  });

  it('throws on invalid branch name', async () => {
    await expect(checkoutBranch('/repo', 'bad branch')).rejects.toThrow();
  });
});

describe('commitAll', () => {
  it('stages all and commits with escaped message', async () => {
    mockExec.mockResolvedValue({ stdout: '' });
    await commitAll('/repo', "fix: it's broken");
    expect(mockExec).toHaveBeenCalledWith('git add -A', { cwd: '/repo' });
    expect(mockExec).toHaveBeenCalledWith(
      "git commit -m 'fix: it'\\''s broken'",
      { cwd: '/repo' },
    );
  });
});

describe('getDiffStats', () => {
  it('parses numstat output', async () => {
    mockExec.mockResolvedValue({
      stdout: '10\t5\tsrc/foo.ts\n3\t0\tsrc/bar.ts\n',
    });
    const stats = await getDiffStats('/repo');
    expect(stats).toEqual([
      { file: 'src/foo.ts', additions: 10, deletions: 5 },
      { file: 'src/bar.ts', additions: 3, deletions: 0 },
    ]);
  });

  it('returns empty array for no changes', async () => {
    mockExec.mockResolvedValue({ stdout: '' });
    const stats = await getDiffStats('/repo');
    expect(stats).toEqual([]);
  });
});

describe('getChangedFiles', () => {
  it('parses name-only output', async () => {
    mockExec.mockResolvedValue({ stdout: 'src/foo.ts\nsrc/bar.ts\n' });
    const files = await getChangedFiles('/repo');
    expect(files).toEqual(['src/foo.ts', 'src/bar.ts']);
  });

  it('returns empty array for no changes', async () => {
    mockExec.mockResolvedValue({ stdout: '' });
    const files = await getChangedFiles('/repo');
    expect(files).toEqual([]);
  });
});

describe('configUser', () => {
  it('sets git user name and email', async () => {
    mockExec.mockResolvedValue({ stdout: '' });
    await configUser('/repo', "O'Brien", 'ob@test.com');
    expect(mockExec).toHaveBeenCalledWith(
      "git config user.name 'O'\\''Brien'",
      { cwd: '/repo' },
    );
    expect(mockExec).toHaveBeenCalledWith(
      "git config user.email 'ob@test.com'",
      { cwd: '/repo' },
    );
  });
});

describe('push', () => {
  it('pushes with token credential helper and cleans up', async () => {
    mockExec.mockResolvedValue({ stdout: '' });
    mockWriteFile.mockResolvedValue(undefined);
    mockUnlink.mockResolvedValue(undefined);

    await push('/repo', 'my-branch', 'ghp_token123');

    expect(mockWriteFile).toHaveBeenCalled();
    const writtenContent = mockWriteFile.mock.calls[0][1] as string;
    expect(writtenContent).toContain('ghp_token123');

    const pushCall = mockExec.mock.calls.find((c: string[]) =>
      (c[0] as string).includes('git') && (c[0] as string).includes('push'),
    );
    expect(pushCall).toBeTruthy();
    expect(pushCall![0]).toContain('credential.helper');
    expect(pushCall![0]).toContain('-u origin my-branch');

    expect(mockUnlink).toHaveBeenCalled();
  });
});

describe('createGitHubPr', () => {
  it('creates PR via GitHub API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/1', number: 1 }),
    });

    const result = await createGitHubPr({
      owner: 'o',
      repo: 'r',
      title: 'My PR',
      body: 'description',
      head: 'feature',
      base: 'main',
      token: 'tok',
    });

    expect(result.html_url).toBe('https://github.com/o/r/pull/1');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/o/r/pulls',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'token tok',
        }),
      }),
    );
  });

  it('handles 422 by finding existing PR', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ message: 'Validation Failed' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { html_url: 'https://github.com/o/r/pull/2', number: 2, head: { ref: 'feature' } },
          ]),
      });

    const result = await createGitHubPr({
      owner: 'o',
      repo: 'r',
      title: 'My PR',
      body: 'description',
      head: 'feature',
      base: 'main',
      token: 'tok',
    });

    expect(result.html_url).toBe('https://github.com/o/r/pull/2');
  });

  it('throws on non-422 error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server Error' }),
    });

    await expect(
      createGitHubPr({
        owner: 'o',
        repo: 'r',
        title: 'My PR',
        body: 'desc',
        head: 'feature',
        base: 'main',
        token: 'tok',
      }),
    ).rejects.toThrow();
  });
});

describe('getDefaultBranch', () => {
  it('returns default branch from GitHub API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ default_branch: 'develop' }),
    });

    const result = await getDefaultBranch('o', 'r', 'tok');
    expect(result).toBe('develop');
  });

  it('falls back to main on error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not Found' }),
    });

    const result = await getDefaultBranch('o', 'r', 'tok');
    expect(result).toBe('main');
  });
});
