/**
 * חיבור ה-mock ל-instance של axios באמצעות axios-mock-adapter.
 * כל הבקשות עוברות דרך אותו axios ואותם interceptors כמו מול שרת אמיתי –
 * ההחלפה לשרת NestJS אמיתית = פשוט לא לקרוא ל-installMockApi (VITE_USE_MOCK=false).
 */
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { handle, HttpError } from './router';
import { mockSettings } from './settings';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function parseBody(data: unknown): unknown {
  if (typeof data !== 'string' || data === '') return data ?? null;
  try {
    const parsed: unknown = JSON.parse(data);
    return parsed;
  } catch {
    return data;
  }
}

function toParams(p: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (p && typeof p === 'object') {
    for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
      if (v !== undefined && v !== null) out[k] = String(v);
    }
  }
  return out;
}

function headerValue(config: AxiosRequestConfig, name: string): string | undefined {
  const h = config.headers as Record<string, unknown> | undefined;
  if (!h) return undefined;
  const v = h[name] ?? h[name.toLowerCase()];
  return typeof v === 'string' ? v : undefined;
}

export function installMockApi(http: AxiosInstance): MockAdapter {
  const mock = new MockAdapter(http);

  mock.onAny().reply(async (config): Promise<[number, unknown]> => {
    const { minLatencyMs, maxLatencyMs, simulateErrors } = mockSettings.get();
    await sleep(minLatencyMs + Math.random() * (maxLatencyMs - minLatencyMs));

    const base = config.baseURL ?? '';
    let path = config.url ?? '';
    if (base && path.startsWith(base)) path = path.slice(base.length);
    path = path.split('?')[0] ?? '';

    const method = (config.method ?? 'get').toLowerCase();
    if (simulateErrors && path !== '/auth/login' && Math.random() < 0.25) {
      return [500, { message: 'שגיאת שרת מדומה (מתג "הדמיית שגיאות" פעיל)' }];
    }
    try {
      const data = handle({
        method,
        path,
        params: toParams(config.params),
        body: parseBody(config.data),
        authorized: Boolean(headerValue(config, 'Authorization')),
      });
      return [method === 'post' ? 201 : 200, data];
    } catch (err) {
      if (err instanceof HttpError)
        return [err.status, { message: err.message, details: err.details }];
      return [500, { message: err instanceof Error ? err.message : 'שגיאה לא צפויה' }];
    }
  });

  return mock;
}
