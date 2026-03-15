import { describe, it, expect, vi } from 'vitest';
import { checkBudget, recordCostEvent, logActivity, type ExecutionContext } from '../executor.js';

function mockDb() {
  const store: Record<string, any[]> = {};
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'test-id' }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  };
}

describe('executor', () => {
  describe('checkBudget', () => {
    it('returns not allowed when agent not found', async () => {
      const db = mockDb();
      const ctx: ExecutionContext = { db, orgId: 'org-1', agentId: 'agent-1' };
      const result = await checkBudget(ctx);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('returns allowed with remaining when under budget', async () => {
      const db = mockDb();
      db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { budgetMonthlyCents: 1000, spentMonthlyCents: 200 },
          ]),
        }),
      });

      const ctx: ExecutionContext = { db, orgId: 'org-1', agentId: 'agent-1' };
      const result = await checkBudget(ctx);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(800);
    });

    it('returns not allowed when over budget', async () => {
      const db = mockDb();
      db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { budgetMonthlyCents: 100, spentMonthlyCents: 100 },
          ]),
        }),
      });

      const ctx: ExecutionContext = { db, orgId: 'org-1', agentId: 'agent-1' };
      const result = await checkBudget(ctx);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('returns allowed with Infinity remaining when no budget set', async () => {
      const db = mockDb();
      db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { budgetMonthlyCents: 0, spentMonthlyCents: 0 },
          ]),
        }),
      });

      const ctx: ExecutionContext = { db, orgId: 'org-1', agentId: 'agent-1' };
      const result = await checkBudget(ctx);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
    });
  });

  describe('recordCostEvent', () => {
    it('inserts cost event and updates agent spend', async () => {
      const db = mockDb();
      const ctx: ExecutionContext = { db, orgId: 'org-1', agentId: 'agent-1' };

      await recordCostEvent(ctx, {
        provider: 'anthropic',
        model: 'claude-sonnet-4-5',
        inputTokens: 100,
        outputTokens: 50,
        costCents: 10,
      });

      expect(db.insert).toHaveBeenCalled();
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe('logActivity', () => {
    it('inserts activity log entry', async () => {
      const db = mockDb();
      const ctx: ExecutionContext = { db, orgId: 'org-1', agentId: 'agent-1' };

      await logActivity(ctx, 'test_action', { foo: 'bar' });

      expect(db.insert).toHaveBeenCalled();
    });
  });
});

describe('heartbeat processor', () => {
  it('exports createHeartbeatProcessor', async () => {
    const { createHeartbeatProcessor } = await import('../queues/heartbeat.js');
    expect(typeof createHeartbeatProcessor).toBe('function');
  });

  it('creates a processor function', async () => {
    const { createHeartbeatProcessor } = await import('../queues/heartbeat.js');
    const db = mockDb();
    const processor = createHeartbeatProcessor(db);
    expect(typeof processor).toBe('function');
  });

  it.todo('processes heartbeat job with budget check');
  it.todo('rejects job when budget exceeded');
  it.todo('handles execution errors gracefully');
});
