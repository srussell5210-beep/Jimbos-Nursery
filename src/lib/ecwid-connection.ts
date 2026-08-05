// Thin wrapper around Ecwid's REST API (https://app.ecwid.com/api/v3).
// Auth is a single static "secret token" from a private app on
// https://my.ecwid.com/#develop-apps — no OAuth dance needed, unlike Clover.

const ECWID_API_BASE = 'https://app.ecwid.com/api/v3';

export function ecwidStoreId(): string {
  return process.env.ECWID_STORE_ID || '9145043';
}

export function isEcwidConfigured(): boolean {
  return !!process.env.ECWID_API_TOKEN;
}

export async function ecwidFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = process.env.ECWID_API_TOKEN;
  if (!token) {
    throw new Error('Ecwid is not configured (ECWID_API_TOKEN missing).');
  }
  return fetch(`${ECWID_API_BASE}/${ecwidStoreId()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}
