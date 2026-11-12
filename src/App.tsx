import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './components/AppLayout';
import { LoadingState } from './components/States';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';

// מסך הפרויקט (כולל MapLibre) נטען בעצלתיים – chunk נפרד
const ProjectPage = lazy(() => import('./pages/ProjectPage'));

/** HashRouter – כדי שה-build הסטטי יעבוד מכל נתיב / שרת קבצים */
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/projects" element={<ProjectsPage />} />
            <Route
              path="/projects/:projectId"
              element={
                <Suspense fallback={<LoadingState label="טוען מפה…" />}>
                  <ProjectPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </HashRouter>
  );
}
