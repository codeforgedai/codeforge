import { describe, it, expect } from 'vitest';
import { getProfile, setProfile } from '../lib/client.js';

describe('config profiles', () => {
  it('defaults to dev profile', () => {
    setProfile('dev');
    expect(getProfile().name).toBe('dev');
  });

  it('switches to production profile', () => {
    setProfile('production');
    expect(getProfile().name).toBe('production');
    setProfile('dev');
  });

  it('uses correct base URL per profile', () => {
    setProfile('dev');
    expect(getProfile().baseUrl).toContain('localhost:3100');
  });

  it('throws on unknown profile', () => {
    expect(() => setProfile('unknown')).toThrow('Unknown profile: unknown');
  });
});
