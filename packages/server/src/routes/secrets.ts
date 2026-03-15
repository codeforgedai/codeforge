import { Router } from 'ultimate-express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { secrets, secretVersions } from '@codeforce/db';
import { encrypt, decrypt, resolveMasterKey } from '../secrets/encryption.js';
import { createHash } from 'node:crypto';

const createSecretSchema = z.object({
  orgId: z.string().min(1),
  name: z.string().min(1).max(200),
  value: z.string().min(1),
  description: z.string().optional(),
});

export function secretsRouter(db: any) {
  const router = Router();
  const masterKey = resolveMasterKey();

  router.post('/', async (req: any, res: any) => {
    const parsed = createSecretSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const material = encrypt(parsed.data.value, masterKey);
    const valueSha256 = createHash('sha256').update(parsed.data.value).digest('hex');

    const [secret] = await db.insert(secrets).values({
      orgId: parsed.data.orgId,
      name: parsed.data.name,
      description: parsed.data.description,
    }).returning();

    await db.insert(secretVersions).values({
      secretId: secret.id,
      version: 1,
      material,
      valueSha256,
    });

    res.status(201).json({ ...secret, valueSha256 });
  });

  router.get('/', async (req: any, res: any) => {
    const orgId = req.query.orgId as string;
    if (!orgId) {
      return res.status(400).json({ error: 'orgId query parameter required' });
    }
    const result = await db.select().from(secrets).where(eq(secrets.orgId, orgId));
    res.json(result);
  });

  router.get('/:id', async (req: any, res: any) => {
    const [secret] = await db.select().from(secrets)
      .where(eq(secrets.id, req.params.id));
    if (!secret) return res.status(404).json({ error: 'Not found' });
    res.json(secret);
  });

  router.post('/:id/versions', async (req: any, res: any) => {
    const valueSchema = z.object({ value: z.string().min(1) });
    const parsed = valueSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [secret] = await db.select().from(secrets)
      .where(eq(secrets.id, req.params.id));
    if (!secret) return res.status(404).json({ error: 'Not found' });

    const newVersion = (secret.latestVersion ?? 1) + 1;
    const material = encrypt(parsed.data.value, masterKey);
    const valueSha256 = createHash('sha256').update(parsed.data.value).digest('hex');

    await db.insert(secretVersions).values({
      secretId: secret.id,
      version: newVersion,
      material,
      valueSha256,
    });

    const [updated] = await db.update(secrets)
      .set({ latestVersion: newVersion, updatedAt: new Date() })
      .where(eq(secrets.id, req.params.id))
      .returning();

    res.status(201).json({ ...updated, valueSha256 });
  });

  router.get('/:id/versions/:version/decrypt', async (req: any, res: any) => {
    const version = parseInt(req.params.version, 10);
    const [sv] = await db.select().from(secretVersions)
      .where(and(
        eq(secretVersions.secretId, req.params.id),
        eq(secretVersions.version, version),
      ));
    if (!sv) return res.status(404).json({ error: 'Version not found' });

    if (sv.revokedAt) {
      return res.status(410).json({ error: 'Secret version has been revoked' });
    }

    const value = decrypt(sv.material as any, masterKey);
    res.json({ value });
  });

  return router;
}
