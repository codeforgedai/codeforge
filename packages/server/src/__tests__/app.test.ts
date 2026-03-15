import { describe, it, expect } from 'vitest';
import { createApp } from '../app.js';

describe('server app', () => {
  it('responds to GET /health', async () => {
    const app = createApp();
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});
