import { describe, it, expect } from 'vitest';
import { agents, agentConfigRevisions, agentRuntimeState, agentTaskSessions } from '../schema/agents.js';

describe('agents schema', () => {
  it('agents table has status and reports_to columns', () => {
    const cols = Object.keys(agents);
    expect(cols).toContain('status');
    expect(cols).toContain('reportsTo');
    expect(cols).toContain('adapterType');
    expect(cols).toContain('budgetMonthlyCents');
    expect(cols).toContain('permissions');
  });

  it('agent_runtime_state tracks token usage', () => {
    const cols = Object.keys(agentRuntimeState);
    expect(cols).toContain('totalInputTokens');
    expect(cols).toContain('totalCostCents');
  });
});
