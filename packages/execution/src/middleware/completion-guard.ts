import { hasUncommittedChanges } from '../swe/git.js';
import type { ClaudeSdkResult } from '../adapters/claude-sdk.js';

const RETRY_PROMPT =
  'You did not make any code changes. The task requires implementation. Please re-read the plan and make the necessary changes. Do not just describe what to do — actually edit the files.';

export async function ensureCompletion(
  cwd: string,
  result: ClaudeSdkResult,
  retryFn: (prompt: string) => Promise<ClaudeSdkResult>,
  maxRetries = 2,
): Promise<ClaudeSdkResult> {
  let current = result;

  for (let i = 0; i < maxRetries; i++) {
    if (await hasUncommittedChanges(cwd)) {
      return current;
    }
    current = await retryFn(RETRY_PROMPT);
  }

  return current;
}
