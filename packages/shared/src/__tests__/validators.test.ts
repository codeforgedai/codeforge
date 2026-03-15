import { describe, it, expect } from 'vitest';
import {
  AgentStatus,
  OrgStatus,
  TaskStatus,
  PipelineRunStatus,
  agentStatusTransitions,
} from '../constants.js';
import { isValidTransition } from '../validators.js';

describe('agent status transitions', () => {
  it('allows idle → running', () => {
    expect(isValidTransition(agentStatusTransitions, 'idle', 'running')).toBe(true);
  });
  it('blocks running → terminated directly', () => {
    expect(isValidTransition(agentStatusTransitions, 'running', 'terminated')).toBe(false);
  });
  it('allows idle → terminated', () => {
    expect(isValidTransition(agentStatusTransitions, 'idle', 'terminated')).toBe(true);
  });
  it('allows idle → paused', () => {
    expect(isValidTransition(agentStatusTransitions, 'idle', 'paused')).toBe(true);
  });
});
