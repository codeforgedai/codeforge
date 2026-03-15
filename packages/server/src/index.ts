import { createApp } from './app.js';
import { createDb } from '@codeforce/db';

const port = parseInt(process.env.PORT || '3100', 10);

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  import('./dev-mode.js').then(m => m.startDevMode());
} else {
  const db = createDb(process.env.DATABASE_URL);
  const app = createApp(db);
  app.listen(port, () => {
    console.log(`Codeforce server listening on port ${port}`);
  });
}
