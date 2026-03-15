import {
  hasUncommittedChanges,
  hasUnpushedCommits,
  getCurrentBranch,
  checkoutBranch,
  configUser,
  commitAll,
  push,
  createGitHubPr,
  getDefaultBranch,
} from '../swe/git.js';

export interface SafetyNetPrParams {
  cwd: string;
  taskId: string;
  repoOwner: string;
  repoName: string;
  githubToken: string;
}

export async function safetyNetPr(params: SafetyNetPrParams): Promise<string | null> {
  const { cwd, taskId, repoOwner, repoName, githubToken } = params;

  const uncommitted = await hasUncommittedChanges(cwd);
  const unpushed = await hasUnpushedCommits(cwd);

  if (!uncommitted && !unpushed) return null;

  const expectedBranch = `codeforce/${taskId}`;
  const currentBranch = await getCurrentBranch(cwd);

  if (currentBranch !== expectedBranch) {
    await checkoutBranch(cwd, expectedBranch);
  }

  if (uncommitted) {
    await configUser(cwd, 'codeforce[bot]', 'bot@codeforce.dev');
    await commitAll(cwd, 'chore: auto-commit from codeforce swe step');
  }

  await push(cwd, expectedBranch, githubToken);

  const baseBranch = await getDefaultBranch(repoOwner, repoName, githubToken);

  const pr = await createGitHubPr({
    owner: repoOwner,
    repo: repoName,
    title: `[codeforce] ${taskId}`,
    body: 'Auto-generated draft PR from codeforce safety net.',
    head: expectedBranch,
    base: baseBranch,
    token: githubToken,
  });

  return pr?.html_url ?? null;
}
