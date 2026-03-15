import { createDb } from '@codeforce/db';
import { createApp } from './app.js';
import { DevRealtimeProvider } from './realtime/provider.js';

export async function startDevMode() {
  console.log('Starting Codeforce in dev mode (PGlite + in-memory)...');

  const db = createDb();
  const _realtime = new DevRealtimeProvider();
  const app = createApp(db);

  const port = parseInt(process.env.PORT || '3100', 10);
  app.listen(port, () => {
    console.log(`Codeforce dev server listening on port ${port}`);
    console.log('Using PGlite (no external DB needed)');
    console.log('Using in-memory queues (no Redis needed)');
  });
}
