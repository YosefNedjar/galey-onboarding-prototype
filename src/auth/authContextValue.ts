import { createContext } from 'react';
import type { LoginResponse } from '../types/domain';
import type { Session } from './session';

export interface AuthContextValue {
  session: Session | null;
  signIn: (res: LoginResponse) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
