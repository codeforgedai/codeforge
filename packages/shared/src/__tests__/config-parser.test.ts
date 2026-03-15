import { describe, it, expect } from 'vitest';
import { parseTeamConfig, validateReportsToHierarchy } from '../config-parser.js';

const validYaml = `
name: Test Team
agents:
  ceo:
    model: claude-sonnet-4-5
    role: ceo
    tools: []
    budget_monthly_cents: 50000
  cto:
    model: claude-sonnet-4-5
    role: cto
    reports_to: ceo
    tools:
      - create_task
pipeline:
  name: test-pipeline
  steps:
    - id: plan
      type: agent
`;

describe('config parser', () => {
  it('parses valid config', () => {
    const config = parseTeamConfig(validYaml);
    expect(config.name).toBe('Test Team');
    expect(Object.keys(config.agents)).toHaveLength(2);
    expect(config.agents.ceo.role).toBe('ceo');
    expect(config.agents.cto.reports_to).toBe('ceo');
    expect(config.pipeline?.name).toBe('test-pipeline');
  });

  it('rejects missing required fields', () => {
    const invalidYaml = `
name: Bad Team
agents:
  bad:
    role: swe
`;
    expect(() => parseTeamConfig(invalidYaml)).toThrow();
  });

  it('validates no cycles in reports_to', () => {
    expect(() => validateReportsToHierarchy({
      a: { model: 'x', role: 'a', reports_to: 'b', tools: [], budget_monthly_cents: 0, context_mode: 'thin' },
      b: { model: 'x', role: 'b', reports_to: 'a', tools: [], budget_monthly_cents: 0, context_mode: 'thin' },
    })).toThrow('Cycle detected');
  });

  it('rejects reports_to unknown agent', () => {
    expect(() => validateReportsToHierarchy({
      a: { model: 'x', role: 'a', reports_to: 'unknown', tools: [], budget_monthly_cents: 0, context_mode: 'thin' },
    })).toThrow('unknown agent');
  });

  it('accepts deferred fields without error', () => {
    const yamlWithExtra = `
name: Extended Team
agents:
  bot:
    model: claude-sonnet-4-5
    role: swe
    custom_field: some_value
    another_extra: 42
`;
    const config = parseTeamConfig(yamlWithExtra);
    expect((config.agents.bot as any).custom_field).toBe('some_value');
  });
});
