import { describe, it, expect } from 'vitest';
import { isTokenExpired } from '../github/token-manager.js';

describe('github token manager', () => {
  it('detects expired token', () => {
    const pastDate = new Date(Date.now() - 10 * 60 * 1000);
    expect(isTokenExpired(pastDate)).toBe(true);
  });

  it('detects token within buffer as expired', () => {
    const soonDate = new Date(Date.now() + 3 * 60 * 1000); // 3 min from now
    expect(isTokenExpired(soonDate, 5 * 60 * 1000)).toBe(true);
  });

  it('detects valid token', () => {
    const futureDate = new Date(Date.now() + 30 * 60 * 1000);
    expect(isTokenExpired(futureDate)).toBe(false);
  });
});
