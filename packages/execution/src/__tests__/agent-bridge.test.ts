import { describe, it, expect } from 'vitest';
import { buildThreadId, validateThreadOwnership } from '../agent-bridge.js';

describe('agent-bridge', () => {
  describe('buildThreadId', () => {
    it('builds correct thread ID format', () => {
      const threadId = buildThreadId('org-1', 'agent-1', 'proj-1');
      expect(threadId).toBe('org_org-1_agent_agent-1_project_proj-1');
    });

    it('includes all components', () => {
      const threadId = buildThreadId('abc', 'def', 'ghi');
      expect(threadId).toContain('abc');
      expect(threadId).toContain('def');
      expect(threadId).toContain('ghi');
    });
  });

  describe('validateThreadOwnership', () => {
    it('passes for matching org', () => {
      const threadId = 'org_org-1_agent_agent-1_project_proj-1';
      expect(() => validateThreadOwnership(threadId, 'org-1')).not.toThrow();
    });

    it('throws for mismatched org', () => {
      const threadId = 'org_org-1_agent_agent-1_project_proj-1';
      expect(() => validateThreadOwnership(threadId, 'org-2')).toThrow(
        'does not belong to org org-2',
      );
    });

    it('throws for empty threadId with wrong org', () => {
      expect(() => validateThreadOwnership('org_x_stuff', 'y')).toThrow();
    });
  });
});
