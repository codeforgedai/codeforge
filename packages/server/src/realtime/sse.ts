import { Router } from 'ultimate-express';
import type { RealtimeProvider } from './provider.js';

export function sseRouter(realtime: RealtimeProvider) {
  const router = Router();

  router.get('/runs/:runId/stream', (req: any, res: any) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const channel = `run:${req.params.runId}`;
    const handler = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    realtime.subscribe(channel, handler);
    req.on('close', () => realtime.unsubscribe(channel));
  });

  return router;
}
