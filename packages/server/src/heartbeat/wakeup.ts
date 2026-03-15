import { eq, and } from 'drizzle-orm';
import { wakeupRequests } from '@codeforce/db';

export async function createWakeupRequest(db: any, params: {
  agentId: string;
  orgId: string;
  source: string;
  triggerDetail?: string;
  idempotencyKey?: string;
}) {
  if (params.idempotencyKey) {
    const [existing] = await db.select().from(wakeupRequests)
      .where(and(
        eq(wakeupRequests.agentId, params.agentId),
        eq(wakeupRequests.idempotencyKey, params.idempotencyKey),
      ));
    if (existing) {
      return existing;
    }
  }

  const [request] = await db.insert(wakeupRequests).values({
    agentId: params.agentId,
    orgId: params.orgId,
    source: params.source,
    triggerDetail: params.triggerDetail,
    idempotencyKey: params.idempotencyKey,
    status: 'queued',
  }).returning();

  return request;
}

export async function coalesceWakeupRequests(db: any, agentId: string) {
  const queued = await db.select().from(wakeupRequests)
    .where(and(
      eq(wakeupRequests.agentId, agentId),
      eq(wakeupRequests.status, 'queued'),
    ));

  if (queued.length <= 1) {
    return queued[0] ?? null;
  }

  const primary = queued[0];
  const rest = queued.slice(1);

  for (const req of rest) {
    await db.update(wakeupRequests)
      .set({ status: 'coalesced' })
      .where(eq(wakeupRequests.id, req.id));
  }

  await db.update(wakeupRequests)
    .set({ coalescedCount: rest.length })
    .where(eq(wakeupRequests.id, primary.id));

  return { ...primary, coalescedCount: rest.length };
}
