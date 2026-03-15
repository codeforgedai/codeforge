export interface SwePromptParams {
  cwd: string;
  plan: string;
  filesToChange: string[];
  taskId: string;
  repoRules: string;
}

const WORKING_ENV_SECTION = `## Working Environment

You are operating in a local workspace at \`{cwd}\`. You must always call a tool every turn — never respond with only text.`;

const TASK_CONTEXT_SECTION = `## Task Context

**Task ID:** {taskId}

**Plan from architect:**
{plan}

**Files to change:**
{filesToChangeList}

### Workflow
1. **Understand** — Read the relevant files and understand the codebase before making changes.
2. **Implement** — Make the changes described in the plan.
3. **Verify** — Run tests, typechecks, and linters to confirm correctness.
4. **Commit** — Commit your changes with a well-formatted message.`;

const CODING_STANDARDS_SECTION = `## Coding Standards

- Always read a file before modifying it.
- Fix root causes, not symptoms. Do not apply band-aid fixes.
- Maintain the existing code style and conventions of the repository.
- Do not add inline comments unless absolutely necessary.
- Write concise docstrings only when they add real value.
- Do not add copyright or license headers to files.
- Never create backup files (e.g. \`.bak\`, \`.orig\`, \`.backup\`).
- After applying a fix, re-run the relevant commands to verify it works.
- Only use trusted, well-known packages — do not introduce obscure dependencies.`;

const CORE_BEHAVIOR_SECTION = `## Core Behavior

- **Persistence** — Keep working until the task is fully complete. Do not stop at partial solutions. If something fails, debug and retry with a different approach.
- **Accuracy** — Verify your work by running tests and checks. Do not assume code is correct without validation.
- **Autonomy** — Make decisions independently based on the plan. Do not ask for clarification unless truly blocked with no way forward.`;

const COMMIT_FORMAT_SECTION = `## Commit Format

Use the format: \`<type>: <concise description>\`

Types: \`fix\`, \`feat\`, \`chore\`, \`ci\`

Examples:
- \`fix: resolve null pointer in auth middleware\`
- \`feat: add JWT token validation\`
- \`chore: update dependency versions\``;

const REPO_RULES_SECTION = `## Repository Rules

{repoRules}`;

export function constructSwePrompt(params: SwePromptParams): string {
  const { cwd, plan, filesToChange, taskId, repoRules } = params;

  const filesToChangeList = filesToChange.length > 0
    ? filesToChange.map((f) => `- \`${f}\``).join('\n')
    : '(No specific files listed — determine from plan)';

  const sections = [
    WORKING_ENV_SECTION.replace('{cwd}', cwd),
    TASK_CONTEXT_SECTION
      .replace('{taskId}', taskId)
      .replace('{plan}', plan)
      .replace('{filesToChangeList}', filesToChangeList),
    CODING_STANDARDS_SECTION,
    CORE_BEHAVIOR_SECTION,
    COMMIT_FORMAT_SECTION,
  ];

  if (repoRules.trim().length > 0) {
    sections.push(REPO_RULES_SECTION.replace('{repoRules}', repoRules));
  }

  return sections.join('\n\n');
}
