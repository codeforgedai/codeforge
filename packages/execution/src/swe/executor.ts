import { setupWorkspace, readRepoRules, type WorkspaceConfig } from './workspace.js';
import { constructSwePrompt } from './prompt.js';
import { executeClaudeSdk } from '../adapters/claude-sdk.js';
import { ensureCompletion } from '../middleware/completion-guard.js';
import { safetyNetPr } from '../middleware/safety-net-pr.js';
import { getDiffStats, getChangedFiles } from './git.js';

export interface SweExecutionConfig {
  orgId: string;
  projectId: string;
  taskId: string;
  agentId: string;
  plan: string;
  filesToChange: string[];
  workspace: WorkspaceConfig;
  githubToken: string;
  maxTurns?: number;
}

export interface SweExecutionResult {
  filesChanged: string[];
  summary: string;
  prUrl: string | null;
  diffStats: { additions: number; deletions: number };
  tokensIn: number;
  tokensOut: number;
  costCents: number;
}

const DEFAULT_MAX_TURNS = 50;
const ALLOWED_TOOLS = ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep'];

export async function executeSwe(config: SweExecutionConfig): Promise<SweExecutionResult> {
  const {
    taskId,
    plan,
    filesToChange,
    workspace,
    githubToken,
    maxTurns = DEFAULT_MAX_TURNS,
  } = config;

  const userPrompt = `Implement the following plan:\n\n${plan}`;
  let cwd: string;

  try {
    cwd = await setupWorkspace(workspace, taskId, githubToken);

    const repoRules = await readRepoRules(cwd);

    const systemPrompt = constructSwePrompt({
      cwd,
      plan,
      filesToChange,
      taskId,
      repoRules,
    });

    const result = await executeClaudeSdk(userPrompt, {
      cwd,
      maxTurns,
      allowedTools: ALLOWED_TOOLS,
      systemPrompt,
    });

    const finalResult = await ensureCompletion(cwd, result, (retryPrompt) =>
      executeClaudeSdk(retryPrompt, {
        cwd,
        maxTurns,
        allowedTools: ALLOWED_TOOLS,
        systemPrompt,
      }),
    );

    const prUrl = await safetyNetPr({
      cwd,
      taskId,
      repoOwner: workspace.repoOwner,
      repoName: workspace.repoName,
      githubToken,
    });

    const diffStats = await getDiffStats(cwd);
    const filesChanged = await getChangedFiles(cwd);

    return {
      filesChanged,
      summary: finalResult.output,
      prUrl,
      diffStats,
      tokensIn: finalResult.tokensIn,
      tokensOut: finalResult.tokensOut,
      costCents: 0,
    };
  } catch (error) {
    if (cwd!) {
      await safetyNetPr({
        cwd,
        taskId,
        repoOwner: workspace.repoOwner,
        repoName: workspace.repoName,
        githubToken,
      }).catch(() => {});
    }

    throw error;
  }
}
