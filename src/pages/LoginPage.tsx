import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { authApi } from '../api/endpoints';
import { useAuth } from '../auth/useAuth';
import { BRAND } from '../theme/theme';
import { errorMessage } from '../api/http';

const LOGO = `${import.meta.env.BASE_URL}galey-israel-logo.png`;

export default function LoginPage() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    location.state && typeof location.state === 'object' && 'from' in location.state
      ? String(location.state.from)
      : '/projects';
  const [username, setUsername] = useState('');
  const [touched, setTouched] = useState(false);

  const login = useMutation({
    mutationFn: (u: string) => authApi.login(u),
    onSuccess: (res) => {
      signIn(res);
      navigate(from, { replace: true });
    },
  });

  // אחרי התחברות (או אם כבר מחובר) – חזרה לדף שממנו הגיע המשתמש
  if (session) return <Navigate to={from} replace />;

  const invalid = touched && username.trim().length === 0;
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (username.trim()) login.mutate(username.trim());
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: `radial-gradient(circle at 20% 20%, ${BRAND.turquoise}33, transparent 40%),
          radial-gradient(circle at 80% 70%, ${BRAND.violet}22, transparent 45%),
          linear-gradient(160deg, ${BRAND.ink}, #142A6B)`,
        p: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={onSubmit}
        sx={{ p: 4, width: '100%', maxWidth: 420 }}
        elevation={8}
      >
        <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
          <Box component="img" src={LOGO} alt="גלי ישראל" sx={{ height: 96 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5">Site Planner</Typography>
            <Typography color="text.secondary">מתכנן אתרי תקשורת</Typography>
            <Typography variant="caption" sx={{ color: BRAND.blue, fontWeight: 600 }}>
              תוכנית חפיפה - צוות גלי ישראל
            </Typography>
          </Box>
          <Alert severity="info" sx={{ width: '100%' }}>
            התחברות מדומה – כל שם משתמש יתקבל.
          </Alert>
          {login.isError && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {errorMessage(login.error)}
            </Alert>
          )}
          <TextField
            label="שם משתמש"
            fullWidth
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched(true)}
            error={invalid}
            helperText={invalid ? 'יש להזין שם משתמש' : ' '}
          />
          <TextField label="סיסמה" type="password" fullWidth helperText="לא נבדקת בפרוטוטייפ" />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            loading={login.isPending}
          >
            כניסה
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
