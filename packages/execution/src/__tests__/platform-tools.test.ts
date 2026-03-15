import { describe, it, expect } from 'vitest';
import { buildPlatformTools } from '../platform-tools.js';

describe('platform-tools', () => {
  const tools = buildPlatformTools({ db: null, orgId: 'org-1' });

  it('returns 12 tools', () => {
    expect(tools).toHaveLength(12);
  });

  it('each tool has an id and description', () => {
    for (const tool of tools) {
      expect(tool.id).toBeTruthy();
      expect(tool.description).toBeTruthy();
    }
  });

  it('has expected tool ids', () => {
    const ids = tools.map((t) => t.id);
    expect(ids).toContain('write_project_doc');
    expect(ids).toContain('read_project_docs');
    expect(ids).toContain('create_goal');
    expect(ids).toContain('create_task');
    expect(ids).toContain('update_task');
    expect(ids).toContain('add_task_comment');
    expect(ids).toContain('list_tasks');
    expect(ids).toContain('read_pr_diff');
    expect(ids).toContain('list_project_files');
    expect(ids).toContain('trigger_pipeline');
    expect(ids).toContain('request_approval');
    expect(ids).toContain('hire_agent');
  });

  it('each tool has an execute function', () => {
    for (const tool of tools) {
      expect(typeof tool.execute).toBe('function');
    }
  });

  it('tools have input and output schemas', () => {
    for (const tool of tools) {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.outputSchema).toBeDefined();
    }
  });

  it('read_pr_diff returns stub data', async () => {
    const tool = tools.find((t) => t.id === 'read_pr_diff')!;
    const result: any = await tool.execute!({ context: { pullRequestId: 'pr-123' } } as any);
    expect(result.diff).toContain('Stub');
    expect(result.prNumber).toBeNull();
  });

  it('list_project_files returns stub data', async () => {
    const tool = tools.find((t) => t.id === 'list_project_files')!;
    const result: any = await tool.execute!({ context: { projectId: 'proj-1', path: '.' } } as any);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]).toContain('Stub');
  });
});
