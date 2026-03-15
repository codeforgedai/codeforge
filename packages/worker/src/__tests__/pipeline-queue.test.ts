import { describe, it, expect, vi } from 'vitest';

function mockDb() {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'run-1' }]),
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

describe('pipeline processor', () => {
  it('exports createPipelineProcessor', async () => {
    const { createPipelineProcessor } = await import('../queues/pipeline.js');
    expect(typeof createPipelineProcessor).toBe('function');
  });

  it('creates a processor function', async () => {
    const { createPipelineProcessor } = await import('../queues/pipeline.js');
    const db = mockDb();
    const processor = createPipelineProcessor(db);
    expect(typeof processor).toBe('function');
  });

  it('throws when pipeline config not found', async () => {
    const { createPipelineProcessor } = await import('../queues/pipeline.js');
    const db = mockDb();
    const processor = createPipelineProcessor(db);

    const job = {
      data: { pipelineConfigId: 'missing', taskId: 'task-1', orgId: 'org-1' },
    } as any;

    await expect(processor(job)).rejects.toThrow('Pipeline config missing not found');
  });

  it.todo('processes pipeline with steps and records cost');
  it.todo('handles changes_requested verdict from review step');
  it.todo('handles execution failure gracefully');
});
