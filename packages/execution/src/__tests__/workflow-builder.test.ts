import { describe, it, expect } from 'vitest';
import { buildWorkflow } from '../workflow-builder.js';

describe('workflow-builder', () => {
  it('builds a workflow with correct name and step count', () => {
    const workflow = buildWorkflow({
      name: 'test-workflow',
      orgId: 'org-1',
      projectId: 'proj-1',
      steps: [
        { stepType: 'pm-review', agentId: 'agent-pm', config: {} },
        { stepType: 'architect', agentId: 'agent-arch', config: {} },
      ],
    });

    expect(workflow.name).toBe('test-workflow');
    expect(workflow.stepCount).toBe(2);
    expect(typeof workflow.run).toBe('function');
  });

  it('runs a sequential workflow', async () => {
    const workflow = buildWorkflow({
      name: 'full-pipeline',
      orgId: 'org-1',
      projectId: 'proj-1',
      steps: [
        { stepType: 'pm-review', agentId: 'agent-pm', config: {} },
        { stepType: 'architect', agentId: 'agent-arch', config: {} },
      ],
    });

    const result = await workflow.run({
      taskTitle: 'Implement feature X',
      taskDescription: 'Build feature X with tests',
    });

    expect(result.success).toBe(true);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]!.stepId).toBe('pm-review');
    expect(result.steps[1]!.stepId).toBe('architect');
    expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
  });

  it('throws on unknown step type', () => {
    expect(() =>
      buildWorkflow({
        name: 'bad',
        orgId: 'org-1',
        projectId: 'proj-1',
        steps: [{ stepType: 'nonexistent', agentId: 'a1', config: {} }],
      }),
    ).toThrow('Unknown step type');
  });
});
