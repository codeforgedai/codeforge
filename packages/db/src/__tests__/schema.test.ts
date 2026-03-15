import { describe, it, expect } from 'vitest';
import { organizations, orgMemberships, users } from '../schema/tenancy.js';

describe('tenancy schema', () => {
  it('organizations table has required columns', () => {
    expect(organizations).toBeDefined();
    const cols = Object.keys(organizations);
    expect(cols).toContain('id');
    expect(cols).toContain('name');
    expect(cols).toContain('status');
    expect(cols).toContain('budgetMonthlyCents');
  });

  it('orgMemberships table has principal_type column', () => {
    expect(orgMemberships).toBeDefined();
    const cols = Object.keys(orgMemberships);
    expect(cols).toContain('principalType');
  });
});
