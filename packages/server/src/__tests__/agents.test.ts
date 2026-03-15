import { describe, it } from 'vitest';

describe('agents route', () => {
  it('creates an agent in pending_approval status');
  it('auto-dedup shortname on conflict');
  it('lists agents by orgId');
  it('gets agent by id');
  it('validates status transitions');
  it('rejects invalid status transitions');
  it('updates agent config and creates revision');
});
