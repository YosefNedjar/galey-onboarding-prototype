import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { App } from './App';
import { theme } from './theme/theme';
import { RtlProvider } from './theme/RtlProvider';
import { AuthProvider } from './auth/AuthContext';
import { Notifications } from './components/Notifications';
import { http, ApiError, errorMessage } from './api/http';
import { installMockApi } from './mock/installMockApi';
import { notify } from './lib/notify';

// Mock API – כברירת מחדל. VITE_USE_MOCK=false → עבודה מול NestJS אמיתי ב-VITE_API_URL
if (import.meta.env.VITE_USE_MOCK !== 'false') installMockApi(http);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, err) =>
        !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
      refetchOnWindowFocus: false,
    },
  },
  // הודעת Snackbar על שגיאת רענון ברקע (כשכבר יש נתונים מוצגים)
  queryCache: new QueryCache({
    onError: (err, query) => {
      if (query.state.data !== undefined) notify.warning(`רענון נתונים נכשל: ${errorMessage(err)}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (err, _vars, _ctx, mutation) => {
      // מוטציות שמטפלות בשגיאה בעצמן (onError מקומי) לא מקבלות הודעה כפולה
      if (!mutation.options.onError) notify.error(errorMessage(err));
    },
  }),
});

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <RtlProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={{ 'html, body, #root': { height: '100%' } }} />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
            <Notifications />
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </QueryClientProvider>
      </ThemeProvider>
    </RtlProvider>
  </StrictMode>,
);
