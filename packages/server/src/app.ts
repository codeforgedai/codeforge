import express from 'ultimate-express';
import type { createDb } from '@codeforce/db';
import { orgsRouter } from './routes/orgs.js';
import { agentsRouter } from './routes/agents.js';
import { tasksRouter } from './routes/tasks.js';
import { goalsRouter } from './routes/goals.js';
import { projectsRouter } from './routes/projects.js';
import { approvalsRouter } from './routes/approvals.js';
import { secretsRouter } from './routes/secrets.js';
import { billingRouter } from './routes/billing.js';
import { pipelinesRouter } from './routes/pipelines.js';
import { sseRouter } from './realtime/sse.js';
import { DevRealtimeProvider } from './realtime/provider.js';

export function createApp(db?: ReturnType<typeof createDb>) {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  if (db) {
    app.use('/api/v1/orgs', orgsRouter(db));
    app.use('/api/v1/agents', agentsRouter(db));
    app.use('/api/v1/tasks', tasksRouter(db));
    app.use('/api/v1/goals', goalsRouter(db));
    app.use('/api/v1/projects', projectsRouter(db));
    app.use('/api/v1/approvals', approvalsRouter(db));
    app.use('/api/v1/secrets', secretsRouter(db));
    app.use('/api/v1/billing', billingRouter(db));
    app.use('/api/v1/pipelines', pipelinesRouter(db));
  }

  const realtime = new DevRealtimeProvider();
  app.use('/api/v1/realtime', sseRouter(realtime));

  return app;
}
