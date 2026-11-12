import { useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useCreateProject } from '../../queries/projects';
import type { Project, ProjectInput } from '../../types/domain';
import { REGION_LABEL, REGIONS } from '../../lib/labels';
import { hasErrors, validateProject, type FieldErrors } from '../../lib/validation';
import { errorMessage } from '../../api/http';
import { notify } from '../../lib/notify';

const EMPTY: ProjectInput = { name: '', description: '', region: 'center' };

export function CreateProjectDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  const [values, setValues] = useState<ProjectInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<ProjectInput>>({});
  const create = useCreateProject();

  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  const close = () => {
    setValues(EMPTY);
    setErrors({});
    create.reset();
    onClose();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateProject(values);
    setErrors(errs);
    if (hasErrors(errs)) return;
    create.mutate(values, {
      onSuccess: (p) => {
        notify.success(`הפרויקט "${p.name}" נוצר`);
        close();
        onCreated(p);
      },
    });
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <form onSubmit={submit} noValidate>
        <DialogTitle>פרויקט חדש</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {create.isError && <Alert severity="error">{errorMessage(create.error)}</Alert>}
            <TextField
              label="שם הפרויקט"
              required
              autoFocus
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name ?? ' '}
            />
            <TextField
              label="תיאור"
              multiline
              minRows={2}
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description ?? ' '}
            />
            <TextField
              select
              label="אזור"
              value={values.region}
              onChange={(e) => set('region', e.target.value as ProjectInput['region'])}
              error={Boolean(errors.region)}
              helperText={errors.region ?? ' '}
            >
              {REGIONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {REGION_LABEL[r]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>ביטול</Button>
          <Button type="submit" variant="contained" loading={create.isPending}>
            יצירה
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
