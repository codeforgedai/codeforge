import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export function encrypt(plaintext: string, masterKey: Buffer): { iv: string; ciphertext: string; tag: string } {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, masterKey, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    ciphertext: encrypted.toString('base64'),
    tag: tag.toString('base64'),
  };
}

export function decrypt(material: { iv: string; ciphertext: string; tag: string }, masterKey: Buffer): string {
  const decipher = createDecipheriv(ALGORITHM, masterKey, Buffer.from(material.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(material.tag, 'base64'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(material.ciphertext, 'base64')), decipher.final()]);
  return decrypted.toString('utf8');
}

export function resolveMasterKey(): Buffer {
  const envKey = process.env.CODEFORCE_SECRETS_MASTER_KEY;
  if (envKey) return Buffer.from(envKey, 'hex');

  const keyFile = process.env.CODEFORCE_SECRETS_MASTER_KEY_FILE;
  if (keyFile) {
    return Buffer.from(readFileSync(keyFile, 'utf8').trim(), 'hex');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('CODEFORCE_SECRETS_MASTER_KEY is required in production');
  }

  const key = randomBytes(32);
  console.warn('WARNING: Auto-generated master key. Set CODEFORCE_SECRETS_MASTER_KEY for production.');
  return key;
}
