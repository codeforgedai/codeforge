export interface Profile {
  name: string;
  baseUrl: string;
}

const PROFILES: Record<string, Profile> = {
  dev: { name: 'dev', baseUrl: 'http://localhost:3100/api/v1' },
  production: { name: 'production', baseUrl: process.env.CODEFORCE_API_URL || 'http://localhost:3100/api/v1' },
};

let currentProfile = 'dev';

export function setProfile(name: string) {
  if (!PROFILES[name]) throw new Error(`Unknown profile: ${name}`);
  currentProfile = name;
}

export function getProfile(): Profile {
  return PROFILES[currentProfile];
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const profile = getProfile();
  const res = await fetch(`${profile.baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}
