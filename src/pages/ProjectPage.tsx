import { useCallback, useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import AddIcon from '@mui/icons-material/Add';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import '../features/map/maplibreSetup';
import { useProjectQuery } from '../queries/projects';
import { useCreateSite, useDeleteSite, useSitesQuery, useUpdateSite } from '../queries/sites';
import { useTasksQuery } from '../queries/tasks';
import { ErrorState, LoadingState } from '../components/States';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { SitesGrid } from '../features/sites/SitesGrid';
import { SiteFormDialog } from '../features/sites/SiteFormDialog';
import { DEFAULT_SITE, siteToInput } from '../features/sites/siteDefaults';
import { MapView, type MapSelection } from '../features/map/MapView';
import { LayersPanel } from '../features/map/LayersPanel';
import { layerRegistry } from '../features/map/layerRegistry';
import { TasksPanel } from '../features/tasks/TasksPanel';
import { CoverageLayers } from '../features/tasks/CoverageLayers';
import {
  EMPTY_COVERAGE_VIEW,
  isComparing,
  type CoverageView,
} from '../features/tasks/coverageView';
import { REGION_LABEL } from '../lib/labels';
import { notify } from '../lib/notify';
import type { CalcTask, Site, SiteInput } from '../types/domain';

type FormState =
  | { open: false }
  | { open: true; mode: 'create'; initial: SiteInput; key: number }
  | { open: true; mode: 'edit'; site: Site; initial: SiteInput; key: number };

/** הודעה כשמשימה מסתיימת + הצגה אוטומטית של התוצאה על המפה */
function useTaskCompletion(tasks: CalcTask[] | undefined, onDone: (t: CalcTask) => void) {
  const prev = useRef<Map<string, CalcTask['status']>>(new Map());
  useEffect(() => {
    if (!tasks) return;
    for (const t of tasks) {
      const before = prev.current.get(t.id);
      const wasActive = before === 'queued' || before === 'running';
      if (wasActive && t.status === 'done') {
        notify.success(`ריצה #${t.runNumber} הסתיימה – התוצאה מוצגת על המפה`);
        onDone(t);
      } else if (wasActive && t.status === 'failed') {
        notify.error(`ריצה #${t.runNumber} נכשלה`);
      }
      prev.current.set(t.id, t.status);
    }
  }, [tasks, onDone]);
}

export default function ProjectPage() {
  const { projectId = '' } = useParams();
  const project = useProjectQuery(projectId);
  const sitesQuery = useSitesQuery(projectId);
  const tasksQuery = useTasksQuery(projectId);
  const createSite = useCreateSite(projectId);
  const updateSite = useUpdateSite(projectId);
  const deleteSite = useDeleteSite(projectId);

  const [tab, setTab] = useState<'sites' | 'tasks'>('sites');
  const [selection, setSelection] = useState<MapSelection>({ id: null, source: 'grid' });
  const [addMode, setAddMode] = useState(false);
  const [fitSignal, setFitSignal] = useState(0);
  const [form, setForm] = useState<FormState>({ open: false });
  const [toDelete, setToDelete] = useState<Site | null>(null);
  const [coverageView, setCoverageView] = useState<CoverageView>(EMPTY_COVERAGE_VIEW);
  const formKey = useRef(0);

  const sites = sitesQuery.data ?? [];

  // ביציאה מהפרויקט – ניקוי כל השכבות מהרישום
  useEffect(() => () => layerRegistry.reset(), [projectId]);

  const onTaskDone = useCallback(
    (t: CalcTask) => setCoverageView((v) => (isComparing(v) ? v : { ...v, shownTaskId: t.id })),
    [],
  );
  useTaskCompletion(tasksQuery.data, onTaskDone);

  const openCreate = useCallback((coords?: { lng: number; lat: number }) => {
    formKey.current += 1;
    setForm({
      open: true,
      mode: 'create',
      key: formKey.current,
      initial: { ...DEFAULT_SITE, ...(coords ?? {}) },
    });
  }, []);

  const openEdit = useCallback((site: Site) => {
    formKey.current += 1;
    setForm({ open: true, mode: 'edit', site, initial: siteToInput(site), key: formKey.current });
  }, []);

  const closeForm = () => {
    setForm({ open: false });
    createSite.reset();
    updateSite.reset();
  };

  const submitForm = (input: SiteInput) => {
    if (!form.open) return;
    if (form.mode === 'create') {
      createSite.mutate(input, {
        onSuccess: (s) => {
          notify.success(`האתר "${s.name}" נוצר`);
          closeForm();
          setSelection({ id: s.id, source: 'grid' });
        },
      });
    } else {
      updateSite.mutate(
        { id: form.site.id, input },
        {
          onSuccess: (s) => {
            notify.success(`האתר "${s.name}" עודכן`);
            closeForm();
          },
        },
      );
    }
  };

  const onPickLocation = useCallback(
    (lng: number, lat: number) => {
      setAddMode(false);
      openCreate({ lng, lat });
    },
    [openCreate],
  );

  const onDeleteRequest = useCallback((s: Site) => setToDelete(s), []);
  const onSelectFromMap = useCallback((id: string | null) => {
    setSelection({ id, source: 'map' });
    if (id) setTab('sites');
  }, []);
  const onSelectFromGrid = useCallback(
    (id: string | null) => setSelection({ id, source: 'grid' }),
    [],
  );

  if (project.isPending) return <LoadingState label="טוען פרויקט…" />;
  if (project.isError)
    return (
      <Box sx={{ p: 3 }}>
        <ErrorState error={project.error} onRetry={() => void project.refetch()} />
        <Button component={RouterLink} to="/projects" sx={{ mt: 1 }}>
          חזרה לרשימת הפרויקטים
        </Button>
      </Box>
    );

  const p = project.data;
  const formPending = createSite.isPending || updateSite.isPending;
  const formError = createSite.error ?? updateSite.error;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* כותרת הפרויקט */}
      <Paper square elevation={0} sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Breadcrumbs sx={{ fontSize: 13 }}>
              <Link component={RouterLink} to="/projects" underline="hover" color="inherit">
                פרויקטים
              </Link>
              <Typography color="text.primary" sx={{ fontSize: 13 }}>
                {p.name}
              </Typography>
            </Breadcrumbs>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h6">{p.name}</Typography>
              <Chip
                size="small"
                label={REGION_LABEL[p.region]}
                color="secondary"
                variant="outlined"
              />
              <Chip size="small" label={`${sites.length} אתרים`} />
            </Stack>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreate()}>
            אתר חדש
          </Button>
          <Tooltip title="לחץ על המפה כדי ליצור אתר במיקום הנבחר">
            <ToggleButton
              value="add"
              size="small"
              selected={addMode}
              onChange={() => setAddMode((m) => !m)}
              color="primary"
              sx={{ px: 1.5 }}
            >
              <AddLocationAltIcon fontSize="small" sx={{ ml: 0.5 }} />
              הוספה מהמפה
            </ToggleButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<CenterFocusStrongIcon />}
            onClick={() => setFitSignal((n) => n + 1)}
          >
            התאם תצוגה
          </Button>
        </Stack>
      </Paper>

      {/* Split view: פאנל (ימין ב-RTL) + מפה */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(480px, 46%) 1fr' },
          gridTemplateRows: { xs: '50% 50%', md: '1fr' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            borderInlineEnd: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_e, v: 'sites' | 'tasks') => setTab(v)}
            sx={{ px: 1, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab value="sites" label={`אתרים (${sites.length})`} />
            <Tab
              value="tasks"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <span>משימות חישוב</span>
                  {tasksQuery.data?.some(
                    (t) => t.status === 'queued' || t.status === 'running',
                  ) && <Chip size="small" color="info" label="רץ" sx={{ height: 18 }} />}
                </Stack>
              }
            />
          </Tabs>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {tab === 'sites' ? (
              sitesQuery.isError ? (
                <ErrorState error={sitesQuery.error} onRetry={() => void sitesQuery.refetch()} />
              ) : (
                <SitesGrid
                  sites={sites}
                  loading={sitesQuery.isPending}
                  selectedId={selection.id}
                  revealSelected={selection.source === 'map'}
                  onSelect={onSelectFromGrid}
                  onEdit={openEdit}
                  onDelete={onDeleteRequest}
                />
              )
            ) : (
              <TasksPanel
                projectId={projectId}
                siteCount={sites.length}
                view={coverageView}
                onViewChange={setCoverageView}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative', minHeight: 0 }}>
          <MapView
            sites={sites}
            selection={selection}
            onSelect={onSelectFromMap}
            onEdit={openEdit}
            addMode={addMode}
            onPickLocation={onPickLocation}
            fitKey={projectId}
            fitSignal={fitSignal}
          />
          <LayersPanel />
          {sitesQuery.isFetching && (
            <LinearProgress sx={{ position: 'absolute', top: 0, insetInline: 0, zIndex: 3 }} />
          )}
          {addMode && (
            <Alert
              severity="info"
              onClose={() => setAddMode(false)}
              sx={{
                position: 'absolute',
                bottom: 32,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                boxShadow: 3,
              }}
            >
              לחץ על המפה כדי למקם אתר חדש
            </Alert>
          )}
          {sitesQuery.isSuccess && sites.length === 0 && !addMode && (
            <Alert
              severity="warning"
              sx={{
                position: 'absolute',
                bottom: 32,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                boxShadow: 3,
              }}
            >
              אין אתרים בפרויקט – השתמש ב"הוספה מהמפה" או "אתר חדש"
            </Alert>
          )}
          <CoverageLayers tasks={tasksQuery.data ?? []} view={coverageView} />
        </Box>
      </Box>

      {form.open && (
        <SiteFormDialog
          key={form.key}
          open
          mode={form.mode}
          initial={form.initial}
          pending={formPending}
          error={formError}
          onClose={closeForm}
          onSubmit={submitForm}
        />
      )}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="מחיקת אתר"
        message={`למחוק את "${toDelete?.name ?? ''}"? (מחיקה אופטימית – תשוחזר אם השרת ייכשל)`}
        confirmLabel="מחיקה"
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          if (selection.id === toDelete.id) setSelection({ id: null, source: 'grid' });
          deleteSite.mutate(toDelete);
        }}
      />
    </Box>
  );
}
