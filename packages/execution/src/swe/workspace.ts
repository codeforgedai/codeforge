import { exec as cpExec } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdir, rm, stat, writeFile, unlink, readFile } from 'node:fs/promises';
import { checkoutBranch, getDefaultBranch, validateBranchName } from './git.js';

const VALID_REPO_URL = /^https:\/\/github\.com\/[\w\-./]+\.git$/;

const exec = promisify(cpExec);

export const WORKSPACES_ROOT = join(tmpdir(), 'codeforce-workspaces');

export interface WorkspaceConfig {
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  baseBranch?: string;
}

async function withCredentials<T>(
  token: string,
  taskId: string,
  fn: (credFile: string) => Promise<T>,
): Promise<T> {
  const credFile = `/tmp/.git-credentials-${taskId}`;
  try {
    await writeFile(credFile, `https://x-access-token:${token}@github.com\n`, { mode: 0o600 });
    return await fn(credFile);
  } finally {
    await unlink(credFile).catch(() => {});
  }
}

async function cloneWithRetry(
  repoUrl: string,
  dest: string,
  token: string,
  taskId: string,
): Promise<void> {
  try {
    await withCredentials(token, taskId, async (credFile) => {
      await exec(
        `git -c credential.helper="store --file=${credFile}" clone ${repoUrl} ${dest}`,
      );
    });
  } catch {
    await rm(dest, { recursive: true, force: true }).catch(() => {});
    await withCredentials(token, taskId, async (credFile) => {
      await exec(
        `git -c credential.helper="store --file=${credFile}" clone ${repoUrl} ${dest}`,
      );
    });
  }
}

async function isGitRepo(dir: string): Promise<boolean> {
  try {
    await exec('git rev-parse --is-inside-work-tree', { cwd: dir });
    return true;
  } catch {
    return false;
  }
}

async function dirExists(dir: string): Promise<boolean> {
  try {
    const s = await stat(dir);
    return s.isDirectory();
  } catch {
    return false;
  }
}

export async function setupWorkspace(
  config: WorkspaceConfig,
  taskId: string,
  token: string,
): Promise<string> {
  if (!VALID_REPO_URL.test(config.repoUrl)) {
    throw new Error(`Invalid repo URL: ${config.repoUrl}`);
  }

  await mkdir(WORKSPACES_ROOT, { recursive: true });

  const workspaceDir = join(WORKSPACES_ROOT, config.repoName);

  const baseBranch = config.baseBranch ?? await getDefaultBranch(config.repoOwner, config.repoName, token);
  validateBranchName(baseBranch);

  if (await dirExists(workspaceDir)) {
    if (await isGitRepo(workspaceDir)) {
      try {
        await withCredentials(token, taskId, async (credFile) => {
          await exec(
            `git -c credential.helper="store --file=${credFile}" fetch origin`,
            { cwd: workspaceDir },
          );
        });
        await exec(`git checkout ${baseBranch}`, { cwd: workspaceDir });
        await exec(`git reset --hard origin/${baseBranch}`, { cwd: workspaceDir });
      } catch {
        await rm(workspaceDir, { recursive: true, force: true });
        await cloneWithRetry(config.repoUrl, workspaceDir, token, taskId);
      }
    } else {
      await rm(workspaceDir, { recursive: true, force: true });
      await cloneWithRetry(config.repoUrl, workspaceDir, token, taskId);
    }
  } else {
    await cloneWithRetry(config.repoUrl, workspaceDir, token, taskId);
  }

  await checkoutBranch(workspaceDir, `codeforce/${taskId}`);

  return workspaceDir;
}

export async function readRepoRules(cwd: string): Promise<string> {
  try {
    return await readFile(join(cwd, 'CLAUDE.md'), 'utf-8');
  } catch {
    // fall through
  }

  try {
    return await readFile(join(cwd, 'AGENTS.md'), 'utf-8');
  } catch {
    return '';
  }
}
