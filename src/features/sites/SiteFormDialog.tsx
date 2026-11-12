/** טופס יצירה/עריכה של אתר עם ולידציה (משותפת עם ה"שרת") */
import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import type { SiteInput } from '../../types/domain';
import { hasErrors, validateSite, type FieldErrors } from '../../lib/validation';
import { SITE_STATUS_LABEL, SITE_STATUSES, SITE_TYPE_LABEL, SITE_TYPES } from '../../lib/labels';
import { coverageRadiusKm } from '../../lib/geo';
import { errorMessage } from '../../api/http';

type NumericKey = 'lat' | 'lng' | 'heightM' | 'powerW' | 'frequencyMHz';
type FormValues = Omit<SiteInput, NumericKey> & Record<NumericKey, string>;

const toForm = (s: SiteInput): FormValues => ({
  ...s,
  lat: String(s.lat),
  lng: String(s.lng),
  heightM: String(s.heightM),
  powerW: String(s.powerW),
  frequencyMHz: String(s.frequencyMHz),
});

const num = (v: string) => (v.trim() === '' ? Number.NaN : Number(v));

const toInput = (f: FormValues): SiteInput => ({
  ...f,
  name: f.name.trim(),
  lat: num(f.lat),
  lng: num(f.lng),
  heightM: num(f.heightM),
  powerW: num(f.powerW),
  frequencyMHz: num(f.frequencyMHz),
});

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  initial: SiteInput;
  pending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (input: SiteInput) => void;
}

/** הקומפוננטה מקבלת key מבחוץ, כך שכל פתיחה מתחילה מ-state נקי (בלי useEffect לסנכרון) */
export function SiteFormDialog({ open, mode, initial, pending, error, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>(() => toForm(initial));
  const [errors, setErrors] = useState<FieldErrors<SiteInput>>({});

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const input = toInput(values);
    const errs = validateSite(input);
    setErrors(errs);
    if (!hasErrors(errs)) onSubmit(input);
  };

  const preview = toInput(values);
  const radius =
    Number.isFinite(preview.powerW) && Number.isFinite(preview.heightM)
      ? coverageRadiusKm(preview.powerW, preview.heightM)
      : null;

  const numField = (k: NumericKey, label: string, unit?: string, step = 'any') => (
    <TextField
      label={label}
      type="number"
      value={values[k]}
      onChange={(e) => set(k, e.target.value)}
      error={Boolean(errors[k])}
      helperText={errors[k] ?? ' '}
      slotProps={{
        htmlInput: { step, dir: 'ltr' },
        input: unit
          ? { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> }
          : undefined,
      }}
    />
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={submit} noValidate>
        <DialogTitle>{mode === 'create' ? 'אתר חדש' : 'עריכת אתר'}</DialogTitle>
        <DialogContent>
          {Boolean(error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage(error)}
            </Alert>
          )}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 2, pt: 1 }}>
            <TextField
              label="שם האתר"
              required
              autoFocus
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name ?? ' '}
              sx={{ gridColumn: '1 / -1' }}
            />
            <TextField
              select
              label="סוג"
              value={values.type}
              onChange={(e) => set('type', e.target.value as SiteInput['type'])}
              error={Boolean(errors.type)}
              helperText={errors.type ?? ' '}
            >
              {SITE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {SITE_TYPE_LABEL[t]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="סטטוס"
              value={values.status}
              onChange={(e) => set('status', e.target.value as SiteInput['status'])}
              error={Boolean(errors.status)}
              helperText={errors.status ?? ' '}
            >
              {SITE_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {SITE_STATUS_LABEL[s]}
                </MenuItem>
              ))}
            </TextField>
            {numField('lat', 'קו רוחב (lat)')}
            {numField('lng', 'קו אורך (lng)')}
            {numField('heightM', 'גובה', 'מ׳', '1')}
            {numField('powerW', 'הספק', 'W', '1')}
            {numField('frequencyMHz', 'תדר', 'MHz', '1')}
            <Box sx={{ alignSelf: 'center', pb: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                רדיוס כיסוי משוער (מודל ברירת מחדל)
              </Typography>
              <Typography variant="h6" color="primary">
                {radius !== null ? `${radius} ק״מ` : '—'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>ביטול</Button>
          <Button type="submit" variant="contained" loading={pending}>
            {mode === 'create' ? 'יצירה' : 'שמירה'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
