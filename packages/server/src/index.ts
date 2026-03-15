import { createApp } from './app.js';
import { createDb } from '@codeforce/db';

const port = parseInt(process.env.PORT || '3100', 10);
const db = createDb(process.env.DATABASE_URL);
const app = createApp(db);

app.listen(port, () => {
  console.log(`Codeforce server listening on port ${port}`);
});
