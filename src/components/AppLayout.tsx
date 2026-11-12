import { useState, useSyncExternalStore } from 'react';
import { Link as RouterLink, Outlet } from 'react-router';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import { useAuth } from '../auth/useAuth';
import { mockSettings } from '../mock/settings';
import { BRAND } from '../theme/theme';

const LOGO = `${import.meta.env.BASE_URL}galey-israel-logo.png`;

function DevToolsMenu() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const settings = useSyncExternalStore(mockSettings.subscribe, mockSettings.get);
  return (
    <>
      <Tooltip title="כלי פיתוח (Mock API)">
        <IconButton color="inherit" onClick={(e) => setAnchor(e.currentTarget)}>
          <BugReportOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <Box sx={{ px: 2, py: 1, maxWidth: 300 }}>
          <Typography variant="subtitle2">Mock API</Typography>
          <Typography variant="caption" color="text.secondary">
            השהיה מדומה {settings.minLatencyMs}–{settings.maxLatencyMs}ms לכל בקשה
          </Typography>
        </Box>
        <Divider />
        <MenuItem disableRipple>
          <FormControlLabel
            control={
              <Switch
                checked={settings.simulateErrors}
                onChange={(_e, v) => mockSettings.set({ simulateErrors: v })}
                color="error"
              />
            }
            label="הדמיית שגיאות (~25% מהבקשות)"
          />
        </MenuItem>
      </Menu>
    </>
  );
}

export function AppLayout() {
  const { session, signOut } = useAuth();
  const simulateErrors = useSyncExternalStore(
    mockSettings.subscribe,
    () => mockSettings.get().simulateErrors,
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar
        position="static"
        sx={{
          background: `linear-gradient(90deg, ${BRAND.ink} 0%, #142A6B 60%, ${BRAND.blue} 100%)`,
          borderBottom: `3px solid ${BRAND.turquoise}`,
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Box
            component={RouterLink}
            to="/projects"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src={LOGO}
              alt="גלי ישראל"
              sx={{ height: 40, bgcolor: '#fff', borderRadius: 1.5, p: 0.4 }}
            />
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                Site Planner – מתכנן אתרי תקשורת
              </Typography>
              <Typography variant="caption" sx={{ color: BRAND.turquoise }}>
                תוכנית חפיפה - צוות גלי ישראל · פרוטוטייפ
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }} />
          {simulateErrors && <Chip size="small" color="error" label="מצב שגיאות פעיל" />}
          <DevToolsMenu />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: BRAND.violet, fontSize: 14 }}>
              {session?.user.displayName.slice(0, 1).toUpperCase()}
            </Avatar>
            <Typography variant="body2">{session?.user.displayName}</Typography>
            <Tooltip title="התנתקות">
              <IconButton color="inherit" onClick={signOut}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
