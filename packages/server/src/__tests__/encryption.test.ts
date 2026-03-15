import { describe, it, expect } from 'vitest';
import { randomBytes } from 'node:crypto';
import { encrypt, decrypt } from '../secrets/encryption.js';

describe('encryption', () => {
  const masterKey = randomBytes(32);

  it('round-trips encrypt and decrypt', () => {
    const plaintext = 'super-secret-api-key-12345';
    const material = encrypt(plaintext, masterKey);
    const result = decrypt(material, masterKey);
    expect(result).toBe(plaintext);
  });

  it('produces different IVs for the same plaintext', () => {
    const plaintext = 'same-value';
    const a = encrypt(plaintext, masterKey);
    const b = encrypt(plaintext, masterKey);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('fails to decrypt with a wrong key', () => {
    const plaintext = 'secret-data';
    const material = encrypt(plaintext, masterKey);
    const wrongKey = randomBytes(32);
    expect(() => decrypt(material, wrongKey)).toThrow();
  });

  it('handles empty strings', () => {
    const material = encrypt('', masterKey);
    const result = decrypt(material, masterKey);
    expect(result).toBe('');
  });

  it('handles unicode content', () => {
    const plaintext = 'hello world! 2026';
    const material = encrypt(plaintext, masterKey);
    const result = decrypt(material, masterKey);
    expect(result).toBe(plaintext);
  });
});
