import { useSyncExternalStore } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { notifications } from '../lib/notify';

/** מציג את ההודעה הראשונה בתור; בסגירה עובר לבאה */
export function Notifications() {
  const queue = useSyncExternalStore(notifications.subscribe, notifications.getSnapshot);
  const current = queue[0];
  return (
    <Snackbar
      key={current?.id}
      open={Boolean(current)}
      autoHideDuration={4000}
      onClose={(_e, reason) => {
        if (reason !== 'clickaway') notifications.shift();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        variant="filled"
        severity={current?.severity ?? 'info'}
        onClose={() => notifications.shift()}
        sx={{ minWidth: 300 }}
      >
        {current?.message}
      </Alert>
    </Snackbar>
  );
}
