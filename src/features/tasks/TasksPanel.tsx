import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { CalcTask, PropagationModel, TaskStatus } from '../../types/domain';
import { useCreateTask, useTaskResultQuery, useTasksQuery } from '../../queries/tasks';
import {
  formatDateTime,
  formatNumber,
  MODEL_LABEL,
  MODELS,
  TASK_STATUS_LABEL,
} from '../../lib/labels';
import { EmptyState, ErrorState, SkeletonList } from '../../components/States';
import { errorMessage } from '../../api/http';
import { notify } from '../../lib/notify';
import { CompareRuns } from './CompareRuns';
import { isComparing, type CoverageView } from './coverageView';

const STATUS_COLOR: Record<TaskStatus, 'default' | 'info' | 'success' | 'error'> = {
  queued: 'default',
  running: 'info',
  done: 'success',
  failed: 'error',
};

function TaskSummary({ task }: { task: CalcTask }) {
  const { data, isPending, isError } = useTaskResultQuery(task);
  if (isPending) return <Typography variant="caption">טוען תוצאה…</Typography>;
  if (isError || !data)
    return (
      <Typography variant="caption" color="error">
        שגיאה בטעינת תוצאה
      </Typography>
    );
  return (
    <Typography variant="caption" color="text.secondary">
      {data.summary.sitesCount} אתרים · {formatNumber(data.summary.totalAreaKm2)} קמ״ר · רדיוס ממוצע{' '}
      {formatNumber(data.summary.avgRadiusKm, 1)} ק״מ
    </Typography>
  );
}

function TaskRow({
  task,
  shown,
  canShow,
  onToggleShow,
}: {
  task: CalcTask;
  shown: boolean;
  canShow: boolean;
  onToggleShow: () => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderColor: shown ? 'secondary.main' : undefined }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700 }}>ריצה #{task.runNumber}</Typography>
        <Chip
          size="small"
          label={TASK_STATUS_LABEL[task.status]}
          color={STATUS_COLOR[task.status]}
        />
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }} noWrap>
          {MODEL_LABEL[task.model]} · {task.siteCount} אתרים · {formatDateTime(task.createdAt)}
        </Typography>
        {task.status === 'done' && (
          <Tooltip
            title={
              canShow ? (shown ? 'הסתר מהמפה' : 'הצג על המפה') : 'כבה השוואה כדי להציג ריצה בודדת'
            }
          >
            <span>
              <IconButton
                size="small"
                color={shown ? 'secondary' : 'default'}
                onClick={onToggleShow}
                disabled={!canShow}
              >
                {shown ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
      {task.status === 'queued' && <LinearProgress sx={{ mt: 1 }} />}
      {task.status === 'running' && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={task.progress}
            sx={{ flex: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" dir="ltr">
            {task.progress}%
          </Typography>
        </Stack>
      )}
      {task.status === 'failed' && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          {task.error}
        </Typography>
      )}
      {task.status === 'done' && <TaskSummary task={task} />}
    </Paper>
  );
}

export function TasksPanel({
  projectId,
  siteCount,
  view,
  onViewChange,
}: {
  projectId: string;
  siteCount: number;
  view: CoverageView;
  onViewChange: (v: CoverageView) => void;
}) {
  const [model, setModel] = useState<PropagationModel>('default');
  const { data: tasks, isPending, isError, error, refetch } = useTasksQuery(projectId);
  const createTask = useCreateTask(projectId);
  const comparing = isComparing(view);
  const doneTasks = (tasks ?? []).filter((t) => t.status === 'done');
  const active = (tasks ?? []).some((t) => t.status === 'queued' || t.status === 'running');

  const run = () =>
    createTask.mutate(
      { model },
      {
        onSuccess: (t) => notify.info(`ריצה #${t.runNumber} נוספה לתור`),
        onError: (e) => notify.error(`הפעלת החישוב נכשלה: ${errorMessage(e)}`),
      },
    );

  return (
    <Stack spacing={2} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
          חישוב כיסוי
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField
            select
            size="small"
            label="מודל התפשטות"
            value={model}
            onChange={(e) => setModel(e.target.value as PropagationModel)}
            sx={{ flex: 1 }}
          >
            {MODELS.map((m) => (
              <MenuItem key={m} value={m}>
                {MODEL_LABEL[m]}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={run}
            loading={createTask.isPending}
            disabled={siteCount === 0}
          >
            הרץ חישוב כיסוי
          </Button>
        </Stack>
        {siteCount === 0 && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            אין אתרים בפרויקט – הוסף אתרים לפני הרצת חישוב.
          </Alert>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          הסטטוס מתעדכן ב-polling (refetchInterval) כל שנייה
          {active ? ' – פעיל כעת' : ' – כבוי, אין משימות פעילות'}.
        </Typography>
      </Paper>

      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
          משימות
        </Typography>
        {isPending ? (
          <SkeletonList rows={3} height={64} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="עדיין לא הורצו חישובים"
            description='לחץ "הרץ חישוב כיסוי" כדי להתחיל'
          />
        ) : (
          <Stack spacing={1}>
            {tasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                shown={!comparing && view.shownTaskId === t.id}
                canShow={!comparing}
                onToggleShow={() =>
                  onViewChange({ ...view, shownTaskId: view.shownTaskId === t.id ? null : t.id })
                }
              />
            ))}
          </Stack>
        )}
      </Box>

      <Divider />
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
          השוואת ריצות
        </Typography>
        <CompareRuns doneTasks={doneTasks} view={view} onChange={onViewChange} />
      </Box>
    </Stack>
  );
}
