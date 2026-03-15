import { describe, it, expect, vi } from 'vitest';
import { DevRealtimeProvider, RedisRealtimeProvider } from '../realtime/provider.js';

describe('DevRealtimeProvider', () => {
  it('delivers published events to subscribers', () => {
    const provider = new DevRealtimeProvider();
    const handler = vi.fn();

    provider.subscribe('test-channel', handler);
    provider.publish('test-channel', 'update', { id: 1 });

    expect(handler).toHaveBeenCalledWith('update', { id: 1 });
  });

  it('does not deliver to unsubscribed channels', () => {
    const provider = new DevRealtimeProvider();
    const handler = vi.fn();

    provider.subscribe('channel-a', handler);
    provider.publish('channel-b', 'update', { id: 1 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('stops delivering after unsubscribe', () => {
    const provider = new DevRealtimeProvider();
    const handler = vi.fn();

    provider.subscribe('test-channel', handler);
    provider.publish('test-channel', 'first', {});
    provider.unsubscribe('test-channel');
    provider.publish('test-channel', 'second', {});

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('first', {});
  });

  it('supports multiple subscribers on same channel', () => {
    const provider = new DevRealtimeProvider();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    provider.subscribe('shared', handler1);
    provider.subscribe('shared', handler2);
    provider.publish('shared', 'ping', { ts: 123 });

    expect(handler1).toHaveBeenCalledWith('ping', { ts: 123 });
    expect(handler2).toHaveBeenCalledWith('ping', { ts: 123 });
  });
});

describe('RedisRealtimeProvider', () => {
  it('can be instantiated', () => {
    const provider = new RedisRealtimeProvider('redis://localhost:6379');
    expect(provider).toBeDefined();
  });
});

describe('SSE router', () => {
  it('exports sseRouter factory', async () => {
    const { sseRouter } = await import('../realtime/sse.js');
    expect(typeof sseRouter).toBe('function');
  });
});

describe('WebSocket handler', () => {
  it('exports setupWebSocket', async () => {
    const { setupWebSocket } = await import('../realtime/ws.js');
    expect(typeof setupWebSocket).toBe('function');
  });
});
