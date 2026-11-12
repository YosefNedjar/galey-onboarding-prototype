import { useEffect, useMemo, useState } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  gridExpandedSortedRowIdsSelector,
  useGridApiRef,
  type GridColDef,
  type GridPaginationModel,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { Site } from '../../types/domain';
import { SITE_STATUS_LABEL, SITE_TYPE_COLOR, SITE_TYPE_LABEL, SITE_TYPES } from '../../lib/labels';
import { EmptyState } from '../../components/States';

interface Props {
  sites: Site[];
  loading: boolean;
  selectedId: string | null;
  /** הבחירה הגיעה מהמפה – צריך לקפוץ לעמוד של השורה */
  revealSelected: boolean;
  onSelect: (id: string | null) => void;
  onEdit: (site: Site) => void;
  onDelete: (site: Site) => void;
}

export function SitesGrid({
  sites,
  loading,
  selectedId,
  revealSelected,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  const apiRef = useGridApiRef();
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });

  const columns = useMemo<GridColDef<Site>[]>(
    () => [
      { field: 'name', headerName: 'שם', flex: 1, minWidth: 160 },
      {
        field: 'type',
        headerName: 'סוג',
        width: 105,
        type: 'singleSelect',
        valueOptions: SITE_TYPES.map((t) => ({ value: t, label: SITE_TYPE_LABEL[t] })),
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={SITE_TYPE_LABEL[row.type]}
            sx={{
              bgcolor: `${SITE_TYPE_COLOR[row.type]}1F`,
              color: SITE_TYPE_COLOR[row.type],
              fontWeight: 600,
            }}
          />
        ),
      },
      {
        field: 'status',
        headerName: 'סטטוס',
        width: 100,
        type: 'singleSelect',
        valueOptions: [
          { value: 'active', label: SITE_STATUS_LABEL.active },
          { value: 'planned', label: SITE_STATUS_LABEL.planned },
        ],
        renderCell: ({ row }) => (
          <Chip
            size="small"
            variant="outlined"
            color={row.status === 'active' ? 'success' : 'default'}
            label={SITE_STATUS_LABEL[row.status]}
          />
        ),
      },
      { field: 'heightM', headerName: 'גובה (מ׳)', type: 'number', width: 95 },
      { field: 'powerW', headerName: 'הספק (W)', type: 'number', width: 95 },
      { field: 'frequencyMHz', headerName: 'תדר (MHz)', type: 'number', width: 100 },
      { field: 'lat', headerName: 'Lat', type: 'number', width: 90 },
      { field: 'lng', headerName: 'Lng', type: 'number', width: 90 },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'פעולות',
        width: 90,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditOutlinedIcon />}
            label="עריכה"
            onClick={() => onEdit(row)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteOutlineIcon color="error" />}
            label="מחיקה"
            onClick={() => onDelete(row)}
          />,
        ],
      },
    ],
    [onEdit, onDelete],
  );

  const selectionModel = useMemo<GridRowSelectionModel>(
    () => ({ type: 'include', ids: new Set(selectedId ? [selectedId] : []) }),
    [selectedId],
  );

  // בחירה מהמפה → מעבר לעמוד שבו השורה נמצאת (אחרי מיון/סינון) וגלילה אליה
  useEffect(() => {
    if (!selectedId || !revealSelected || !apiRef.current) return;
    const ids = gridExpandedSortedRowIdsSelector(apiRef);
    const index = ids.indexOf(selectedId);
    if (index < 0) return;
    const page = Math.floor(index / pagination.pageSize);
    if (page !== pagination.page) setPagination((p) => ({ ...p, page }));
    const t = window.setTimeout(() => {
      apiRef.current?.scrollToIndexes({ rowIndex: index % pagination.pageSize });
    }, 50);
    return () => window.clearTimeout(t);
  }, [selectedId, revealSelected, apiRef, pagination.page, pagination.pageSize]);

  return (
    <Box sx={{ height: '100%', minHeight: 0 }}>
      <DataGrid
        apiRef={apiRef}
        rows={sites}
        columns={columns}
        loading={loading}
        density="compact"
        showToolbar
        pagination
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{ sorting: { sortModel: [{ field: 'name', sort: 'asc' }] } }}
        disableMultipleRowSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={(model) => {
          const [first] = [...model.ids];
          onSelect(first === undefined ? null : String(first));
        }}
        slots={{
          noRowsOverlay: () => (
            <EmptyState
              title="אין אתרים בפרויקט"
              description="הוסף אתר מהכפתור או בלחיצה על המפה"
            />
          ),
        }}
        sx={{ border: 0, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
      />
    </Box>
  );
}
