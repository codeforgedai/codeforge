import { describe, it, expect } from 'vitest';
import * as schema from '../schema/index.js';

describe('full schema', () => {
  const requiredTables = [
    'users', 'sessions', 'accounts', 'organizations', 'orgMemberships',
    'agents', 'agentRuntimeState', 'agentConfigRevisions', 'agentTaskSessions',
    'wakeupRequests', 'heartbeatRuns', 'heartbeatRunEvents',
    'goals', 'projects', 'projectWorkspaces', 'projectDocs',
    'tasks', 'taskComments', 'taskLabels', 'taskReadStates', 'pullRequests',
    'labels', 'teams',
    'pipelineConfigs', 'pipelineRuns', 'pipelineSteps', 'agentRuns',
    'approvals', 'approvalComments',
    'secrets', 'secretVersions', 'githubInstallations',
    'costEvents', 'budgets', 'activityLog', 'assets', 'evaluationScores',
    'runLogs', 'taskAttachments',
  ];

  for (const table of requiredTables) {
    it(`exports ${table} table`, () => {
      expect(schema).toHaveProperty(table);
    });
  }
});
