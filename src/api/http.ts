/** instance יחיד של axios לכל האפליקציה + interceptors (auth, נרמול שגיאות) */
import axios, { AxiosError } from 'axios';
import { loadSession } from '../auth/session';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const session = loadSession();
  if (session) config.headers.set('Authorization', `Bearer ${session.token}`);
  return config;
});

/** שגיאה אחידה שה-UI יודע להציג */
export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/** אירוע גלובלי ל-401 – ה-AuthProvider מאזין ומנתק */
export const UNAUTHORIZED_EVENT = 'site-planner:unauthorized';

http.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    if (error instanceof AxiosError) {
      const status = error.response?.status ?? 0;
      const body: unknown = error.response?.data;
      const msg =
        body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
          ? body.message
          : status === 0
            ? 'אין תקשורת עם השרת'
            : `שגיאה ${status}`;
      const details =
        body && typeof body === 'object' && 'details' in body ? body.details : undefined;
      if (status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      return Promise.reject(new ApiError(status, msg, details));
    }
    return Promise.reject(error instanceof Error ? error : new Error('שגיאה לא צפויה'));
  },
);

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'שגיאה לא צפויה';
}
