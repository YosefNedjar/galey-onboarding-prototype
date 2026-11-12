import {
  Alert,
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import type { CalcResult, CalcTask } from '../../types/domain';
import { useTaskResultQuery } from '../../queries/tasks';
import { formatNumber, MODEL_LABEL } from '../../lib/labels';
import { COVERAGE_COLORS, isComparing, type CoverageView } from './coverageView';

function diffCell(a: number, b: number, digits = 0) {
  const d = b - a;
  const color = d > 0 ? 'success.main' : d < 0 ? 'error.main' : 'text.secondary';
  return (
    <TableCell sx={{ color, fontWeight: 600 }} dir="ltr" align="right">
      {d > 0 ? '+' : ''}
      {formatNumber(d, digits)}
    </TableCell>
  );
}

function siteSetDiff(a: CalcResult, b: CalcResult) {
  const sa = new Set(a.coverage.features.map((f) => f.properties.siteId));
  const sb = new Set(b.coverage.features.map((f) => f.properties.siteId));
  return {
    added: [...sb].filter((id) => !sa.has(id)).length,
    removed: [...sa].filter((id) => !sb.has(id)).length,
  };
}

export function CompareRuns({
  doneTasks,
  view,
  onChange,
}: {
  doneTasks: CalcTask[];
  view: CoverageView;
  onChange: (v: CoverageView) => void;
}) {
  const taskA = doneTasks.find((t) => t.id === view.compareA);
  const taskB = doneTasks.find((t) => t.id === view.compareB);
  const ra = useTaskResultQuery(taskA);
  const rb = useTaskResultQuery(taskB);
  const comparing = isComparing(view);

  if (doneTasks.length < 2) {
    return (
      <Alert severity="info" icon={<CompareArrowsIcon />}>
        להשוואה צריך לפחות שתי ריצות שהסתיימו בהצלחה.
      </Alert>
    );
  }

  const select = (key: 'compareA' | 'compareB', color: string, label: string) => (
    <TextField
      select
      size="small"
      label={label}
      value={view[key] ?? ''}
      onChange={(e) => onChange({ ...view, [key]: e.target.value || null })}
      sx={{ flex: 1, '& .MuiOutlinedInput-notchedOutline': { borderColor: color, borderWidth: 2 } }}
    >
      <MenuItem value="">
        <em>—</em>
      </MenuItem>
      {doneTasks.map((t) => (
        <MenuItem
          key={t.id}
          value={t.id}
          disabled={t.id === view[key === 'compareA' ? 'compareB' : 'compareA']}
        >
          ריצה #{t.runNumber} · {MODEL_LABEL[t.model]}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1}>
        {select('compareA', COVERAGE_COLORS.a, 'ריצה A')}
        {select('compareB', COVERAGE_COLORS.b, 'ריצה B')}
      </Stack>
      {comparing && (ra.isPending || rb.isPending) && <LinearProgress />}
      {comparing && (ra.isError || rb.isError) && (
        <Alert severity="error">טעינת תוצאות ההשוואה נכשלה</Alert>
      )}
      {comparing && ra.data && rb.data && taskA && taskB && (
        <Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>מדד</TableCell>
                <TableCell sx={{ color: COVERAGE_COLORS.a, fontWeight: 700 }}>
                  A · #{taskA.runNumber}
                </TableCell>
                <TableCell sx={{ color: COVERAGE_COLORS.b, fontWeight: 700 }}>
                  B · #{taskB.runNumber}
                </TableCell>
                <TableCell>הפרש (B−A)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>מודל</TableCell>
                <TableCell>{MODEL_LABEL[taskA.model]}</TableCell>
                <TableCell>{MODEL_LABEL[taskB.model]}</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>מספר אתרים</TableCell>
                <TableCell>{ra.data.summary.sitesCount}</TableCell>
                <TableCell>{rb.data.summary.sitesCount}</TableCell>
                {diffCell(ra.data.summary.sitesCount, rb.data.summary.sitesCount)}
              </TableRow>
              <TableRow>
                <TableCell>שטח מכוסה כולל (קמ״ר, מקורב)</TableCell>
                <TableCell>{formatNumber(ra.data.summary.totalAreaKm2)}</TableCell>
                <TableCell>{formatNumber(rb.data.summary.totalAreaKm2)}</TableCell>
                {diffCell(ra.data.summary.totalAreaKm2, rb.data.summary.totalAreaKm2)}
              </TableRow>
              <TableRow>
                <TableCell>רדיוס ממוצע (ק״מ)</TableCell>
                <TableCell>{formatNumber(ra.data.summary.avgRadiusKm, 2)}</TableCell>
                <TableCell>{formatNumber(rb.data.summary.avgRadiusKm, 2)}</TableCell>
                {diffCell(ra.data.summary.avgRadiusKm, rb.data.summary.avgRadiusKm, 2)}
              </TableRow>
            </TableBody>
          </Table>
          {(() => {
            const d = siteSetDiff(ra.data, rb.data);
            return (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                בין הריצות: {d.added} אתרים נוספו, {d.removed} הוסרו. השטח הוא סכום שטחי המעגלים
                (חפיפות נספרות פעמיים).
              </Typography>
            );
          })()}
        </Box>
      )}
      {(view.compareA || view.compareB) && (
        <Button size="small" onClick={() => onChange({ ...view, compareA: null, compareB: null })}>
          ניקוי השוואה
        </Button>
      )}
    </Stack>
  );
}
