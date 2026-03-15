export interface TokenInfo {
  token: string;
  expiresAt: Date;
}

export async function getInstallationToken(
  db: any,
  orgId: string,
  _installationId: string,
): Promise<string> {
  // 1. Check github_installations for cached token
  // 2. If not expired (with 5 min buffer), return cached
  // 3. If expired, refresh via GitHub API
  // 4. Atomic update with optimistic lock

  // Stub: in a real implementation, we'd query the DB for cached tokens
  // and refresh via GitHub App JWT + installation token endpoint
  void db;
  void orgId;

  throw new Error('GitHub App not configured. Set GITHUB_APP_ID and GITHUB_PRIVATE_KEY.');
}

export function isTokenExpired(expiresAt: Date, bufferMs = 5 * 60 * 1000): boolean {
  return Date.now() >= expiresAt.getTime() - bufferMs;
}
