import { getStore } from '@netlify/blobs';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export type CloverEnvironment = 'sandbox' | 'production';

export interface CloverConnection {
  environment: CloverEnvironment;
  merchantId: string;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
  apiAccessKey?: string;
  connectedAt: string;
  updatedAt: string;
}

interface StoredPayload {
  version: 1;
  iv: string;
  tag: string;
  data: string;
}

interface CloverTokenResponse {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  access_token_expiration?: number | string;
  accessTokenExpiration?: number | string;
  refresh_token_expiration?: number | string;
  refreshTokenExpiration?: number | string;
  merchant_id?: string;
  merchantId?: string;
}

const STORE_NAME = 'jimbos-clover';
const CONNECTION_KEY = 'connection';
const LOCAL_STORE_PATH = path.join(process.cwd(), '.netlify', 'clover-connection.local.json');

export function getCloverEnvironment(): CloverEnvironment {
  return process.env.CLOVER_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
}

export function getCloverOAuthConfig() {
  const environment = getCloverEnvironment();
  return {
    environment,
    appId: process.env.CLOVER_APP_ID ?? process.env.CLOVER_CLIENT_ID ?? '',
    appSecret: process.env.CLOVER_APP_SECRET ?? process.env.CLOVER_CLIENT_SECRET ?? '',
    merchantId: process.env.CLOVER_MERCHANT_ID ?? '',
  };
}

export function isLikelyCloverAppId(appId: string): boolean {
  return Boolean(appId.trim()) && !appId.includes('@');
}

export function getPublicSiteOrigin(fallbackOrigin: string): string {
  return (process.env.SITE_URL || process.env.URL || fallbackOrigin).replace(/\/$/, '');
}

export function getCloverRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, '')}/api/admin/clover/callback`;
}

export function getCloverAuthorizeUrl(origin: string, state: string): string {
  const { environment, appId, merchantId } = getCloverOAuthConfig();
  const base =
    environment === 'production'
      ? 'https://www.clover.com/oauth/v2/authorize'
      : 'https://sandbox.dev.clover.com/oauth/v2/authorize';
  const url = new URL(base);
  url.searchParams.set('client_id', appId);
  if (merchantId) url.searchParams.set('merchant_id', merchantId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', getCloverRedirectUri(origin));
  url.searchParams.set('state', state);
  return url.toString();
}

export function getCloverApiBase(environment: CloverEnvironment): string {
  return environment === 'production' ? 'https://api.clover.com' : 'https://sandbox.dev.clover.com';
}

function getCloverOAuthApiBase(environment: CloverEnvironment): string {
  return environment === 'production' ? 'https://api.clover.com' : 'https://apisandbox.dev.clover.com';
}

function getCloverChargeBase(environment: CloverEnvironment): string {
  return environment === 'production' ? 'https://scl.clover.com' : 'https://scl-sandbox.dev.clover.com';
}

export function getCloverChargeUrl(environment: CloverEnvironment, pathName: string): string {
  return `${getCloverChargeBase(environment)}${pathName}`;
}

function getEncryptionKey(): Buffer {
  const secret = process.env.CLOVER_CONFIG_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('CLOVER_CONFIG_SECRET or SESSION_SECRET is required to store Clover credentials.');
  }
  return createHash('sha256').update(secret).digest();
}

function encryptConnection(connection: CloverConnection): StoredPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(connection), 'utf8'),
    cipher.final(),
  ]);
  return {
    version: 1,
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: encrypted.toString('base64'),
  };
}

function decryptConnection(payload: StoredPayload): CloverConnection {
  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    Buffer.from(payload.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.data, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8')) as CloverConnection;
}

async function readLocalConnection(): Promise<CloverConnection | null> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, 'utf8');
    return decryptConnection(JSON.parse(raw) as StoredPayload);
  } catch {
    return null;
  }
}

async function writeLocalConnection(connection: CloverConnection): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(encryptConnection(connection)), 'utf8');
}

async function deleteLocalConnection(): Promise<void> {
  await fs.rm(LOCAL_STORE_PATH, { force: true });
}

export async function readCloverConnection(): Promise<CloverConnection | null> {
  try {
    const store = getStore(STORE_NAME);
    const payload = await store.get(CONNECTION_KEY, { type: 'json', consistency: 'strong' }) as StoredPayload | null;
    return payload ? decryptConnection(payload) : null;
  } catch {
    return readLocalConnection();
  }
}

export async function saveCloverConnection(connection: CloverConnection): Promise<void> {
  try {
    const store = getStore(STORE_NAME);
    await store.setJSON(CONNECTION_KEY, encryptConnection(connection));
  } catch {
    await writeLocalConnection(connection);
  }
}

export async function deleteCloverConnection(): Promise<void> {
  try {
    const store = getStore(STORE_NAME);
    await store.delete(CONNECTION_KEY);
  } catch {
    await deleteLocalConnection();
  }
}

function expirationToIso(value: number | string | undefined): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return undefined;
  if (n > 1_000_000_000_000) return new Date(n).toISOString();
  if (n > 1_000_000_000) return new Date(n * 1000).toISOString();
  return new Date(Date.now() + n * 1000).toISOString();
}

function getTokenValue(body: CloverTokenResponse, key: 'access' | 'refresh'): string {
  const value = key === 'access'
    ? body.access_token ?? body.accessToken
    : body.refresh_token ?? body.refreshToken;
  if (!value) throw new Error(`Clover did not return a ${key} token.`);
  return value;
}

// Clover's OAuth/PAKMS endpoints occasionally accept a connection but never
// respond. Without a timeout the callback function hangs until the platform
// kills it, which the browser shows as an endless spinner after "approve".
// Abort after `timeoutMs` so a stall becomes a clear, logged error instead.
async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 12000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Clover request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function requestCloverToken(pathName: string, body: object): Promise<CloverTokenResponse> {
  const { environment } = getCloverOAuthConfig();
  const res = await fetchWithTimeout(`${getCloverOAuthApiBase(environment)}${pathName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Clover OAuth ${pathName} failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json as CloverTokenResponse;
}

export async function exchangeCloverCode(code: string, merchantIdFromQuery: string | null): Promise<CloverConnection> {
  const { environment, appId, appSecret } = getCloverOAuthConfig();
  if (!appId || !appSecret) {
    throw new Error('CLOVER_APP_ID and CLOVER_APP_SECRET are required before connecting Clover.');
  }

  const token = await requestCloverToken('/oauth/v2/token', {
    client_id: appId,
    client_secret: appSecret,
    code,
  });
  const merchantId = merchantIdFromQuery ?? token.merchant_id ?? token.merchantId;
  if (!merchantId) {
    throw new Error('Clover did not return a merchant ID.');
  }

  const now = new Date().toISOString();
  const connection: CloverConnection = {
    environment,
    merchantId,
    accessToken: getTokenValue(token, 'access'),
    refreshToken: token.refresh_token ?? token.refreshToken,
    accessTokenExpiresAt: expirationToIso(token.access_token_expiration ?? token.accessTokenExpiration),
    refreshTokenExpiresAt: expirationToIso(token.refresh_token_expiration ?? token.refreshTokenExpiration),
    connectedAt: now,
    updatedAt: now,
  };

  // The payment (PAKMS) key is only needed for gift-card checkout, not for the
  // connection itself. Don't let a slow/failed key fetch block — or hang — the
  // OAuth callback. Save the tokens now; the key is retried lazily on demand.
  try {
    connection.apiAccessKey = await fetchCloverApiAccessKey(connection);
  } catch (err) {
    console.error('[clover] apiAccessKey fetch failed during connect (will retry later):', err);
  }
  await saveCloverConnection(connection);
  return connection;
}

async function refreshCloverConnection(connection: CloverConnection): Promise<CloverConnection> {
  const { appId, appSecret } = getCloverOAuthConfig();
  if (!connection.refreshToken) return connection;
  if (!appId || !appSecret) return connection;

  const token = await requestCloverToken('/oauth/v2/refresh', {
    client_id: appId,
    client_secret: appSecret,
    refresh_token: connection.refreshToken,
  });

  const refreshed: CloverConnection = {
    ...connection,
    accessToken: getTokenValue(token, 'access'),
    refreshToken: token.refresh_token ?? token.refreshToken ?? connection.refreshToken,
    accessTokenExpiresAt: expirationToIso(token.access_token_expiration ?? token.accessTokenExpiration),
    refreshTokenExpiresAt: expirationToIso(token.refresh_token_expiration ?? token.refreshTokenExpiration) ?? connection.refreshTokenExpiresAt,
    updatedAt: new Date().toISOString(),
  };
  refreshed.apiAccessKey = refreshed.apiAccessKey || await fetchCloverApiAccessKey(refreshed);
  await saveCloverConnection(refreshed);
  return refreshed;
}

function shouldRefresh(connection: CloverConnection): boolean {
  if (!connection.accessTokenExpiresAt) return false;
  return new Date(connection.accessTokenExpiresAt).getTime() - Date.now() < 10 * 60 * 1000;
}

export async function getActiveCloverConnection(): Promise<CloverConnection | null> {
  const connection = await readCloverConnection();
  if (!connection) return null;
  const active = shouldRefresh(connection) ? await refreshCloverConnection(connection) : connection;
  if (!active.apiAccessKey) {
    try {
      active.apiAccessKey = await fetchCloverApiAccessKey(active);
      await saveCloverConnection(active);
    } catch (err) {
      console.error('[clover] apiAccessKey fetch failed (checkout stays unavailable until it succeeds):', err);
    }
  }
  return active;
}

export async function fetchCloverApiAccessKey(connection: CloverConnection): Promise<string> {
  const res = await fetchWithTimeout(getCloverChargeUrl(connection.environment, '/pakms/apikey'), {
    headers: { Authorization: `Bearer ${connection.accessToken}` },
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Clover PAKMS API key request failed (${res.status}): ${JSON.stringify(json)}`);
  }
  const key = json.apiAccessKey ?? json.api_access_key ?? json.key;
  if (!key) {
    throw new Error('Clover did not return an apiAccessKey.');
  }
  return key;
}

export async function cloverFetch(connection: CloverConnection, pathName: string, init: RequestInit = {}) {
  return fetch(`${getCloverApiBase(connection.environment)}${pathName}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${connection.accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
}
