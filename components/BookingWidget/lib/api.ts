/* Pure Next.js API helper for the booking widget
 * Direct connection to Next.js API routes without WordPress dependencies
 */

export interface ApiSettings {
  apiEndpoint?: string; // e.g. http://localhost:3003/api
  apiKey?: string;
}

interface HeiwaApiGlobal {
  settings?: ApiSettings;
}

function safeWindow(): any {
  try {
    return typeof window !== 'undefined' ? window : undefined;
  } catch {
    return undefined;
  }
}

export function getApiSettings(): ApiSettings {
  const w = safeWindow();
  const cfg: HeiwaApiGlobal | undefined = w?.heiwaApiConfig;
  const fromGlobal: ApiSettings = cfg?.settings || {};
  return {
    apiEndpoint:
      fromGlobal.apiEndpoint || process.env.NEXT_PUBLIC_API_BASE || '/api',
    apiKey:
      fromGlobal.apiKey || process.env.NEXT_PUBLIC_API_KEY || 'heiwa_nextjs_key_2024',
  };
}

function joinUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export async function apiFetch(inputPath: string, init: RequestInit = {}): Promise<Response> {
  const { apiEndpoint, apiKey } = getApiSettings();
  const url = joinUrl(apiEndpoint || '/api', inputPath);

  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (!headers.has('X-Heiwa-API-Key')) headers.set('X-Heiwa-API-Key', apiKey || '');

  const controller = (init as any).signal ? undefined : new AbortController();
  const signal = (init as any).signal || controller?.signal;
  const timeout = setTimeout(() => controller?.abort(), 15000);

  try {
    const res = await fetch(url, { ...init, headers, signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export function getApiBase(): string {
  return getApiSettings().apiEndpoint || '/api';
}

export function getApiKey(): string {
  return getApiSettings().apiKey || '';
}
