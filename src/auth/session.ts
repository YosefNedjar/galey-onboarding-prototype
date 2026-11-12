/** ניהול session (פייק) ב-sessionStorage. בגרסה האמיתית: JWT מה-NestJS (Passport). */
import type { LoginResponse, User } from '../types/domain';

const KEY = 'site-planner.session';

export interface Session {
  token: string;
  user: User;
}

export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'token' in parsed &&
      typeof parsed.token === 'string' &&
      'user' in parsed
    ) {
      return parsed as Session;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSession(res: LoginResponse): Session {
  const s: Session = { token: res.token, user: res.user };
  sessionStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function clearSession(): void {
  sessionStorage.removeItem(KEY);
}
