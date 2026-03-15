import { describe, it, expect } from 'vitest';
import { getStepFactory, getAvailableStepTypes } from '../step-registry.js';

describe('step-registry', () => {
  it('has 5 step types', () => {
    const types = getAvailableStepTypes();
    expect(types).toHaveLength(5);
  });

  it('includes all expected step types', () => {
    const types = getAvailableStepTypes();
    expect(types).toContain('pm-review');
    expect(types).toContain('architect');
    expect(types).toContain('swe');
    expect(types).toContain('review');
    expect(types).toContain('report');
  });

  it('each factory returns step with required fields', () => {
    for (const type of getAvailableStepTypes()) {
      const step = getStepFactory(type);
      expect(step.id).toBe(type);
      expect(step.description).toBeTruthy();
      expect(step.inputSchema).toBeDefined();
      expect(step.outputSchema).toBeDefined();
      expect(typeof step.execute).toBe('function');
    }
  });

  it('throws for unknown step type', () => {
    expect(() => getStepFactory('nonexistent')).toThrow('Unknown step type');
  });

  it('pm-review step can execute', async () => {
    const step = getStepFactory('pm-review');
    const result = await step.execute(
      { taskTitle: 'Test task', taskDescription: 'Do the thing' },
      { agentId: 'a1', orgId: 'o1', projectId: 'p1', config: {} },
    );
    expect(result.isReady).toBe(true);
    expect(result.acceptanceCriteria).toBeInstanceOf(Array);
  });
});
