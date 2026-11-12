import { useDeferredValue, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import CellTowerIcon from '@mui/icons-material/CellTower';
import { useProjectsQuery } from '../queries/projects';
import { EmptyState, ErrorState, SkeletonList } from '../components/States';
import { CreateProjectDialog } from '../features/projects/CreateProjectDialog';
import { REGION_LABEL } from '../lib/labels';
import { BRAND } from '../theme/theme';
import type { Project } from '../types/domain';

type View = 'cards' | 'table';

function ProjectCard({ p }: { p: Project }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', borderTop: `4px solid ${BRAND.blue}` }}>
      <CardActionArea component={RouterLink} to={`/projects/${p.id}`} sx={{ height: '100%' }}>
        <CardContent>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <Typography variant="h6" sx={{ fontSize: 18 }}>
              {p.name}
            </Typography>
            <Chip
              size="small"
              label={REGION_LABEL[p.region]}
              color="secondary"
              variant="outlined"
            />
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 1, minHeight: 44 }}>
            {p.description || '—'}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 2 }}>
            <CellTowerIcon fontSize="small" sx={{ color: BRAND.violet }} />
            <Typography variant="body2">{p.siteCount} אתרים</Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {new Date(p.createdAt).toLocaleDateString('he-IL')}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function ProjectsTable({ projects }: { projects: Project[] }) {
  const navigate = useNavigate();
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>שם</TableCell>
            <TableCell>אזור</TableCell>
            <TableCell>אתרים</TableCell>
            <TableCell>בעלים</TableCell>
            <TableCell>נוצר</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((p) => (
            <TableRow
              key={p.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/projects/${p.id}`)}
            >
              <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
              <TableCell>{REGION_LABEL[p.region]}</TableCell>
              <TableCell>{p.siteCount}</TableCell>
              <TableCell>{p.owner}</TableCell>
              <TableCell>{new Date(p.createdAt).toLocaleDateString('he-IL')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim());
  const [view, setView] = useState<View>('cards');
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch, isFetching } = useProjectsQuery({
    search: deferredSearch,
  });

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, mb: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5">פרויקטים</Typography>
          <Typography color="text.secondary">
            בחר פרויקט כדי לתכנן אתרים ולהריץ חישובי כיסוי
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          פרויקט חדש
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
        <TextField
          size="small"
          placeholder="חיפוש לפי שם או תיאור…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, maxWidth: 420, bgcolor: 'background.paper' }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_e, v: View | null) => v && setView(v)}
        >
          <ToggleButton value="cards" aria-label="כרטיסים">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="table" aria-label="טבלה">
            <TableRowsIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Box sx={{ height: 4, mb: 2 }}>{isFetching && !isPending && <LinearProgress />}</Box>

      {isPending ? (
        <SkeletonList rows={3} height={140} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          title={deferredSearch ? 'לא נמצאו פרויקטים' : 'אין עדיין פרויקטים'}
          description={
            deferredSearch ? `אין תוצאות עבור "${deferredSearch}"` : 'צור את הפרויקט הראשון'
          }
          action={
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              פרויקט חדש
            </Button>
          }
        />
      ) : view === 'cards' ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          }}
        >
          {data.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </Box>
      ) : (
        <ProjectsTable projects={data} />
      )}

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(p) => navigate(`/projects/${p.id}`)}
      />
    </Container>
  );
}
