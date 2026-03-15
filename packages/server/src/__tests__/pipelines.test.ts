import { describe, it, expect, vi } from 'vitest';

describe('pipelines router', () => {
  it('exports pipelinesRouter', async () => {
    const { pipelinesRouter } = await import('../routes/pipelines.js');
    expect(typeof pipelinesRouter).toBe('function');
  });

  it.todo('POST /run triggers pipeline and returns run id');
  it.todo('GET /:id returns pipeline config');
  it.todo('GET /runs/:runId returns run with steps');
  it.todo('POST /run returns 404 for missing config');
});

describe('heartbeat wakeup', () => {
  it('exports createWakeupRequest and coalesceWakeupRequests', async () => {
    const { createWakeupRequest, coalesceWakeupRequests } = await import('../heartbeat/wakeup.js');
    expect(typeof createWakeupRequest).toBe('function');
    expect(typeof coalesceWakeupRequests).toBe('function');
  });

  it('createWakeupRequest returns existing on duplicate idempotency key', async () => {
    const { createWakeupRequest } = await import('../heartbeat/wakeup.js');
    const existing = { id: 'wk-1', status: 'queued' };
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([existing]),
        }),
      }),
      insert: vi.fn(),
    };

    const result = await createWakeupRequest(db, {
      agentId: 'a-1',
      orgId: 'org-1',
      source: 'test',
      idempotencyKey: 'key-1',
    });

    expect(result).toEqual(existing);
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('coalesceWakeupRequests returns null when no queued requests', async () => {
    const { coalesceWakeupRequests } = await import('../heartbeat/wakeup.js');
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    };

    const result = await coalesceWakeupRequests(db, 'agent-1');
    expect(result).toBeNull();
  });
});

describe('heartbeat scheduler', () => {
  it('exports createHeartbeatScheduler', async () => {
    const { createHeartbeatScheduler } = await import('../heartbeat/scheduler.js');
    expect(typeof createHeartbeatScheduler).toBe('function');
  });

  it('creates scheduler with start/stop/tick methods', async () => {
    const { createHeartbeatScheduler } = await import('../heartbeat/scheduler.js');
    const db = {};
    const scheduler = createHeartbeatScheduler(db, 60_000);
    expect(typeof scheduler.start).toBe('function');
    expect(typeof scheduler.stop).toBe('function');
    expect(typeof scheduler.tick).toBe('function');
  });

  it.todo('tick creates wakeup requests for due agents');
});
