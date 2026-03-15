import { describe, it, expect } from 'vitest';
import {
  executeAutonomous,
  validateThreadOwnership,
  buildThreadId,
  buildWorkflow,
  getStepFactory,
  getAvailableStepTypes,
  buildPlatformTools,
  executeClaudeSdk,
} from '../index.js';

describe('execution package exports', () => {
  it('exports executeAutonomous', () => {
    expect(typeof executeAutonomous).toBe('function');
  });

  it('exports validateThreadOwnership', () => {
    expect(typeof validateThreadOwnership).toBe('function');
  });

  it('exports buildThreadId', () => {
    expect(typeof buildThreadId).toBe('function');
  });

  it('exports buildWorkflow', () => {
    expect(typeof buildWorkflow).toBe('function');
  });

  it('exports getStepFactory', () => {
    expect(typeof getStepFactory).toBe('function');
  });

  it('exports getAvailableStepTypes', () => {
    expect(typeof getAvailableStepTypes).toBe('function');
  });

  it('exports buildPlatformTools', () => {
    expect(typeof buildPlatformTools).toBe('function');
  });

  it('exports executeClaudeSdk', () => {
    expect(typeof executeClaudeSdk).toBe('function');
  });

  it('buildWorkflow creates a runnable workflow from platform tools', () => {
    const workflow = buildWorkflow({
      name: 'integration-test',
      orgId: 'org-1',
      projectId: 'proj-1',
      steps: [
        { stepType: 'pm-review', agentId: 'pm-1', config: {} },
        { stepType: 'swe', agentId: 'swe-1', config: {} },
        { stepType: 'review', agentId: 'review-1', config: {} },
        { stepType: 'report', agentId: 'report-1', config: {} },
      ],
    });

    expect(workflow.name).toBe('integration-test');
    expect(workflow.stepCount).toBe(4);
    expect(typeof workflow.run).toBe('function');
  });
});
