import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './useAuth';

/** Route guard – מפנה ל-/login ושומר לאן המשתמש ניסה להגיע */
export function RequireAuth() {
  const { session } = useAuth();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
