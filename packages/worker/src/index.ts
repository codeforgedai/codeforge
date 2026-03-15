import { createDb } from '@codeforce/db';

export { checkBudget, recordCostEvent, logActivity } from './executor.js';
export { createHeartbeatProcessor } from './queues/heartbeat.js';
export { createPipelineProcessor } from './queues/pipeline.js';
export type { ExecutionContext } from './executor.js';

export function startWorker(db?: any) {
  const actualDb = db ?? createDb(process.env.DATABASE_URL);
  console.log('Codeforce worker started');
  return { db: actualDb };
}
