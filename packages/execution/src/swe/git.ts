import { exec as cpExec } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { writeFile, unlink } from 'node:fs/promises';

const exec = promisify(cpExec);

const VALID_BRANCH = /^[\w\-./]+$/;

export function validateBranchName(branch: string): void {
  if (!branch || !VALID_BRANCH.test(branch)) {
    throw new Error(`Invalid branch name: ${branch}`);
  }
}

export function escapeForShell(value: string): string {
  return value.replace(/'/g, "'\\''");
}

export async function hasUncommittedChanges(cwd: string): Promise<boolean> {
  const { stdout } = await exec('git status --porcelain', { cwd });
  return stdout.trim().length > 0;
}

export async function hasUnpushedCommits(cwd: string): Promise<boolean> {
  const { stdout } = await exec(
    'git log @{u}..HEAD --oneline 2>/dev/null || echo ""',
    { cwd },
  );
  return stdout.trim().length > 0;
}

export async function getCurrentBranch(cwd: string): Promise<string> {
  const { stdout } = await exec('git rev-parse --abbrev-ref HEAD', { cwd });
  return stdout.trim();
}

export async function checkoutBranch(cwd: string, branch: string): Promise<void> {
  validateBranchName(branch);
  await exec(`git checkout -B ${branch}`, { cwd });
}

export async function commitAll(cwd: string, message: string): Promise<void> {
  await exec('git add -A', { cwd });
  await exec(`git commit -m '${escapeForShell(message)}'`, { cwd });
}

export async function getDiffStats(cwd: string): Promise<{ additions: number; deletions: number }> {
  const { stdout } = await exec('git diff HEAD~1 --numstat 2>/dev/null || echo ""', { cwd });
  let additions = 0;
  let deletions = 0;
  for (const line of stdout.trim().split('\n')) {
    if (!line) continue;
    const [add, del] = line.split('\t');
    const a = parseInt(add, 10);
    const d = parseInt(del, 10);
    if (!isNaN(a)) additions += a;
    if (!isNaN(d)) deletions += d;
  }
  return { additions, deletions };
}

export async function getChangedFiles(cwd: string): Promise<string[]> {
  try {
    const { stdout } = await exec('git diff HEAD~1 --name-only', { cwd });
    if (!stdout.trim()) return [];
    return stdout.trim().split('\n');
  } catch {
    return [];
  }
}

export async function configUser(cwd: string, name: string, email: string): Promise<void> {
  await exec(`git config user.name '${escapeForShell(name)}'`, { cwd });
  await exec(`git config user.email '${escapeForShell(email)}'`, { cwd });
}

export async function push(cwd: string, branch: string, token: string): Promise<void> {
  validateBranchName(branch);
  const credFile = `/tmp/.git-credentials-${randomBytes(8).toString('hex')}`;
  try {
    await writeFile(credFile, `https://x-access-token:${token}@github.com\n`, { mode: 0o600 });
    await exec(
      `git -c credential.helper="store --file=${credFile}" push -u origin ${branch}`,
      { cwd },
    );
  } finally {
    await unlink(credFile).catch(() => {});
  }
}

export interface PrParams {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base: string;
  token: string;
  draft?: boolean;
}

export interface PrResult {
  html_url: string;
  number: number;
}

export async function createGitHubPr(params: PrParams): Promise<PrResult> {
  const { owner, repo, title, body, head, base, token, draft = true } = params;
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, body, head, base, draft }),
  });

  const data = await response.json();

  if (response.ok) {
    return data as PrResult;
  }

  if (response.status === 422) {
    const listUrl = `https://api.github.com/repos/${owner}/${repo}/pulls?head=${owner}:${head}&state=open`;
    const listResponse = await fetch(listUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    const prs = (await listResponse.json()) as PrResult[];
    if (prs.length > 0) return prs[0];
  }

  throw new Error(`GitHub API error: ${(data as { message: string }).message}`);
}

export async function getDefaultBranch(
  owner: string,
  repo: string,
  token: string,
): Promise<string> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) return 'main';

    const data = (await response.json()) as { default_branch: string };
    return data.default_branch;
  } catch {
    return 'main';
  }
}
