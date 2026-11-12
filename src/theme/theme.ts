import { createTheme } from '@mui/material/styles';
import { heIL as coreHeIL } from '@mui/material/locale';
import { heIL as gridHeIL } from '@mui/x-data-grid/locales';

export const BRAND = {
  blue: '#2F5BEA',
  turquoise: '#22D3EE',
  violet: '#A21CAF',
  ink: '#0B1B3F',
} as const;

export const theme = createTheme(
  {
    direction: 'rtl',
    palette: {
      mode: 'light',
      primary: { main: BRAND.blue },
      secondary: { main: '#0EA5C6', light: BRAND.turquoise },
      info: { main: BRAND.violet },
      background: { default: '#F4F7FD', paper: '#FFFFFF' },
      text: { primary: BRAND.ink },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Heebo", "Segoe UI", "Arial", sans-serif',
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { fontWeight: 600 },
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiPaper: { styleOverrides: { rounded: { borderRadius: 12 } } },
      MuiAppBar: { defaultProps: { elevation: 0 } },
    },
  },
  coreHeIL,
  gridHeIL,
);
