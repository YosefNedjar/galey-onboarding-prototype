/** מצבי טעינה / ריק / שגיאה אחידים לכל המסכים */
import type { ReactNode } from 'react';
import { Alert, Box, Button, CircularProgress, Skeleton, Stack, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { errorMessage } from '../api/http';

export function LoadingState({ label = 'טוען…' }: { label?: string }) {
  return (
    <Stack
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'center', py: 6, height: '100%' }}
    >
      <CircularProgress />
      <Typography color="text.secondary">{label}</Typography>
    </Stack>
  );
}

export function SkeletonList({ rows = 4, height = 72 }: { rows?: number; height?: number }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} variant="rounded" height={height} />
      ))}
    </Stack>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Stack
      spacing={1.5}
      sx={{ alignItems: 'center', justifyContent: 'center', py: 6, textAlign: 'center' }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
      <Typography variant="h6">{title}</Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
      {action}
    </Stack>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Box sx={{ p: 2 }}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              נסה שוב
            </Button>
          )
        }
      >
        {errorMessage(error)}
      </Alert>
    </Box>
  );
}
