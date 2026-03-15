import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { mockExec, mockMkdir, mockRm, mockStat, mockWriteFile, mockUnlink, mockReadFile } =
  vi.hoisted(() => ({
    mockExec: vi.fn(),
    mockMkdir: vi.fn(),
    mockRm: vi.fn(),
    mockStat: vi.fn(),
    mockWriteFile: vi.fn(),
    mockUnlink: vi.fn(),
    mockReadFile: vi.fn(),
  }));

const { mockCheckoutBranch, mockGetDefaultBranch } = vi.hoisted(() => ({
  mockCheckoutBranch: vi.fn(),
  mockGetDefaultBranch: vi.fn(),
}));

vi.mock('node:child_process');
vi.mock('node:util', () => ({ promisify: () => mockExec }));
vi.mock('node:fs/promises', () => ({
  mkdir: mockMkdir,
  rm: mockRm,
  stat: mockStat,
  writeFile: mockWriteFile,
  unlink: mockUnlink,
  readFile: mockReadFile,
}));
vi.mock('../../swe/git.js', () => ({
  checkoutBranch: mockCheckoutBranch,
  getDefaultBranch: mockGetDefaultBranch,
}));

import { setupWorkspace, readRepoRules, WORKSPACES_ROOT } from '../../swe/workspace.js';

beforeEach(() => {
  mockExec.mockReset();
  mockMkdir.mockReset();
  mockRm.mockReset();
  mockStat.mockReset();
  mockWriteFile.mockReset();
  mockUnlink.mockReset();
  mockReadFile.mockReset();
  mockCheckoutBranch.mockReset();
  mockGetDefaultBranch.mockReset();

  mockMkdir.mockResolvedValue(undefined);
  mockWriteFile.mockResolvedValue(undefined);
  mockUnlink.mockResolvedValue(undefined);
  mockRm.mockResolvedValue(undefined);
  mockCheckoutBranch.mockResolvedValue(undefined);
});

describe('WORKSPACES_ROOT', () => {
  it('points to tmpdir/codeforce-workspaces', () => {
    expect(WORKSPACES_ROOT).toBe(join(tmpdir(), 'codeforce-workspaces'));
  });
});

describe('readRepoRules', () => {
  it('reads CLAUDE.md if it exists', async () => {
    mockReadFile.mockResolvedValueOnce('# Rules from CLAUDE.md');
    const result = await readRepoRules('/repo');
    expect(result).toBe('# Rules from CLAUDE.md');
    expect(mockReadFile).toHaveBeenCalledWith(join('/repo', 'CLAUDE.md'), 'utf-8');
  });

  it('falls back to AGENTS.md if CLAUDE.md does not exist', async () => {
    mockReadFile
      .mockRejectedValueOnce(new Error('ENOENT'))
      .mockResolvedValueOnce('# Rules from AGENTS.md');

    const result = await readRepoRules('/repo');
    expect(result).toBe('# Rules from AGENTS.md');
    expect(mockReadFile).toHaveBeenCalledWith(join('/repo', 'AGENTS.md'), 'utf-8');
  });

  it('returns empty string if neither file exists', async () => {
    mockReadFile
      .mockRejectedValueOnce(new Error('ENOENT'))
      .mockRejectedValueOnce(new Error('ENOENT'));

    const result = await readRepoRules('/repo');
    expect(result).toBe('');
  });
});

describe('setupWorkspace', () => {
  const config = {
    repoUrl: 'https://github.com/owner/my-repo.git',
    repoOwner: 'owner',
    repoName: 'my-repo',
  };
  const taskId = 'task-123';
  const token = 'ghp_test';
  const expectedDir = join(WORKSPACES_ROOT, 'my-repo');

  it('clones repo if workspace dir does not exist', async () => {
    mockStat.mockRejectedValue(new Error('ENOENT'));
    mockExec.mockResolvedValue({ stdout: '' });
    mockGetDefaultBranch.mockResolvedValue('main');

    const result = await setupWorkspace(config, taskId, token);

    expect(result).toBe(expectedDir);
    expect(mockMkdir).toHaveBeenCalledWith(WORKSPACES_ROOT, { recursive: true });

    const cloneCall = mockExec.mock.calls.find(
      (c: string[]) => c[0].includes('clone'),
    );
    expect(cloneCall).toBeTruthy();
    expect(cloneCall![0]).toContain('credential.helper');
    expect(cloneCall![0]).toContain(config.repoUrl);

    expect(mockCheckoutBranch).toHaveBeenCalledWith(expectedDir, `codeforce/${taskId}`);
  });

  it('uses config.baseBranch when provided', async () => {
    mockStat.mockRejectedValue(new Error('ENOENT'));
    mockExec.mockResolvedValue({ stdout: '' });

    const configWithBranch = { ...config, baseBranch: 'develop' };
    await setupWorkspace(configWithBranch, taskId, token);

    expect(mockGetDefaultBranch).not.toHaveBeenCalled();
  });

  it('fetches and resets when workspace is a valid git repo', async () => {
    mockStat.mockResolvedValue({ isDirectory: () => true });
    mockExec.mockResolvedValue({ stdout: 'true\n' });
    mockGetDefaultBranch.mockResolvedValue('main');

    const result = await setupWorkspace(config, taskId, token);

    expect(result).toBe(expectedDir);

    const fetchCall = mockExec.mock.calls.find(
      (c: string[]) => c[0].includes('fetch'),
    );
    expect(fetchCall).toBeTruthy();
    expect(fetchCall![0]).toContain('credential.helper');

    const checkoutCall = mockExec.mock.calls.find(
      (c: string[]) => c[0].includes('checkout main'),
    );
    expect(checkoutCall).toBeTruthy();

    const resetCall = mockExec.mock.calls.find(
      (c: string[]) => c[0].includes('reset --hard'),
    );
    expect(resetCall).toBeTruthy();
  });

  it('removes and re-clones when existing dir is not a git repo', async () => {
    mockStat.mockResolvedValue({ isDirectory: () => true });
    mockExec
      .mockRejectedValueOnce(new Error('not a git repo'))
      .mockResolvedValue({ stdout: '' });
    mockGetDefaultBranch.mockResolvedValue('main');

    const result = await setupWorkspace(config, taskId, token);

    expect(result).toBe(expectedDir);
    expect(mockRm).toHaveBeenCalledWith(expectedDir, { recursive: true, force: true });

    const cloneCall = mockExec.mock.calls.find(
      (c: string[]) => c[0].includes('clone'),
    );
    expect(cloneCall).toBeTruthy();
  });

  it('removes and re-clones when fetch/reset fails', async () => {
    mockStat.mockResolvedValue({ isDirectory: () => true });
    mockExec
      .mockResolvedValueOnce({ stdout: 'true\n' }) // isGitRepo
      .mockRejectedValueOnce(new Error('fetch failed')) // fetch
      .mockResolvedValue({ stdout: '' }); // clone
    mockGetDefaultBranch.mockResolvedValue('main');

    const result = await setupWorkspace(config, taskId, token);

    expect(result).toBe(expectedDir);
    expect(mockRm).toHaveBeenCalledWith(expectedDir, { recursive: true, force: true });
  });

  it('cleans up credential files', async () => {
    mockStat.mockRejectedValue(new Error('ENOENT'));
    mockExec.mockResolvedValue({ stdout: '' });
    mockGetDefaultBranch.mockResolvedValue('main');

    await setupWorkspace(config, taskId, token);

    expect(mockWriteFile).toHaveBeenCalled();
    const writtenContent = mockWriteFile.mock.calls[0][1] as string;
    expect(writtenContent).toContain(token);

    expect(mockUnlink).toHaveBeenCalled();
  });
});
