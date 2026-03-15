import { describe, it, expect } from 'vitest';
import { constructSwePrompt, type SwePromptParams } from '../../swe/prompt.js';

const baseParams: SwePromptParams = {
  cwd: '/workspace/my-project',
  plan: 'Refactor the auth module to use JWT tokens',
  filesToChange: ['src/auth/login.ts', 'src/auth/middleware.ts'],
  taskId: 'task-abc-123',
  repoRules: '',
};

describe('constructSwePrompt', () => {
  it('includes cwd in working environment section', () => {
    const result = constructSwePrompt(baseParams);
    expect(result).toContain('/workspace/my-project');
    expect(result).toContain('Working Environment');
  });

  it('includes plan and files to change', () => {
    const result = constructSwePrompt(baseParams);
    expect(result).toContain('Refactor the auth module to use JWT tokens');
    expect(result).toContain('`src/auth/login.ts`');
    expect(result).toContain('`src/auth/middleware.ts`');
  });

  it('shows fallback when filesToChange is empty', () => {
    const result = constructSwePrompt({ ...baseParams, filesToChange: [] });
    expect(result).toContain('(No specific files listed — determine from plan)');
  });

  it('includes coding standards from Open SWE', () => {
    const result = constructSwePrompt(baseParams);
    expect(result).toContain('Coding Standards');
    expect(result).toContain('Never create backup files');
    expect(result).toContain('Fix root causes');
  });

  it('includes core behavior section', () => {
    const result = constructSwePrompt(baseParams);
    expect(result).toContain('Persistence');
    expect(result).toContain('Accuracy');
    expect(result).toContain('Autonomy');
  });

  it('includes commit format section', () => {
    const result = constructSwePrompt(baseParams);
    expect(result).toContain('<type>: <concise description>');
    expect(result).toContain('fix');
    expect(result).toContain('feat');
    expect(result).toContain('chore');
    expect(result).toContain('ci');
  });

  it('includes repo rules when provided', () => {
    const result = constructSwePrompt({
      ...baseParams,
      repoRules: 'Always use snake_case for file names.\nNo default exports.',
    });
    expect(result).toContain('Repository Rules');
    expect(result).toContain('Always use snake_case for file names.');
    expect(result).toContain('No default exports.');
  });

  it('omits repo rules section when repoRules is empty', () => {
    const result = constructSwePrompt({ ...baseParams, repoRules: '' });
    expect(result).not.toContain('Repository Rules');
  });

  it('includes taskId in task context', () => {
    const result = constructSwePrompt(baseParams);
    expect(result).toContain('task-abc-123');
  });
});
