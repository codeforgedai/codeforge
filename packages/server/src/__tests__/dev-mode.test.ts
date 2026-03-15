import { describe, it, expect } from 'vitest';
import { createDb } from '@codeforce/db';
import { createApp } from '../app.js';
import { DevRealtimeProvider } from '../realtime/provider.js';

describe('dev mode', () => {
  it('creates app with PGlite when no DATABASE_URL', () => {
    const db = createDb();
    const app = createApp(db);
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  it('uses EventEmitter for real-time (no Redis)', () => {
    const provider = new DevRealtimeProvider();
    let received = false;
    provider.subscribe('test-channel', () => {
      received = true;
    });
    provider.publish('test-channel', 'test-event', { foo: 'bar' });
    expect(received).toBe(true);
    provider.unsubscribe('test-channel');
  });

  it('starts without external dependencies', () => {
    const db = createDb();
    expect(db).toBeDefined();
  });
});
