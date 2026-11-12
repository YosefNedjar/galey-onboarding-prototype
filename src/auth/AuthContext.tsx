import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearSession, loadSession, saveSession, type Session } from './session';
import { AuthContext } from './authContextValue';
import type { LoginResponse } from '../types/domain';
import { UNAUTHORIZED_EVENT } from '../api/http';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const qc = useQueryClient();

  const signIn = useCallback((res: LoginResponse) => setSession(saveSession(res)), []);
  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
    qc.clear();
  }, [qc]);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, signOut);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, signOut);
  }, [signOut]);

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
