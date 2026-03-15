import { eq, and, lt, isNotNull } from 'drizzle-orm';
import { agents } from '@codeforce/db';
import { createWakeupRequest } from './wakeup.js';

export function createHeartbeatScheduler(db: any, intervalMs = 60_000) {
  let timer: ReturnType<typeof setInterval> | null = null;

  async function tick() {
    try {
      const allAgents = await db.select().from(agents)
        .where(and(
          eq(agents.status, 'idle'),
        ));

      const now = Date.now();

      for (const agent of allAgents) {
        const runtimeConfig = (agent.runtimeConfig ?? {}) as Record<string, any>;
        const heartbeat = runtimeConfig.heartbeat;
        if (!heartbeat?.enabled) continue;

        const heartbeatIntervalMs = (heartbeat.intervalMinutes ?? 5) * 60_000;
        const lastBeat = agent.lastHeartbeatAt ? new Date(agent.lastHeartbeatAt).getTime() : 0;

        if (now - lastBeat >= heartbeatIntervalMs) {
          await createWakeupRequest(db, {
            agentId: agent.id,
            orgId: agent.orgId,
            source: 'scheduler',
            triggerDetail: 'heartbeat_interval',
            idempotencyKey: `heartbeat-${agent.id}-${Math.floor(now / heartbeatIntervalMs)}`,
          });
        }
      }
    } catch (err) {
      console.error('Heartbeat scheduler error:', err);
    }
  }

  return {
    start() {
      if (timer) return;
      timer = setInterval(tick, intervalMs);
      tick();
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
    tick,
  };
}
