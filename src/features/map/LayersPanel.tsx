import { useState, useSyncExternalStore } from 'react';
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { layerRegistry } from './layerRegistry';
import { SITE_TYPE_COLOR, SITE_TYPE_LABEL, SITE_TYPES } from '../../lib/labels';

/** פאנל שכבות – קורא את ה-LayerRegistry ומאפשר להדליק/לכבות כל שכבה */
export function LayersPanel() {
  const layers = useSyncExternalStore(layerRegistry.subscribe, layerRegistry.getSnapshot);
  const [open, setOpen] = useState(true);
  return (
    <Paper
      elevation={4}
      // שימו לב: stylis-plugin-rtl הופך left↔right, לכן left כאן = צד ימין במסך
      sx={{ position: 'absolute', top: 12, left: 12, width: 250, zIndex: 2, overflow: 'hidden' }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', px: 1.5, py: 0.5, bgcolor: 'primary.main', color: '#fff' }}
      >
        <LayersIcon fontSize="small" />
        <Typography variant="subtitle2" sx={{ flex: 1, mx: 1 }}>
          שכבות
        </Typography>
        <Tooltip title={open ? 'כווץ' : 'הרחב'}>
          <IconButton size="small" color="inherit" onClick={() => setOpen((o) => !o)}>
            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Collapse in={open}>
        <Box sx={{ p: 1 }}>
          {layers.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
              אין שכבות פעילות
            </Typography>
          )}
          {layers.map((l) => (
            <Stack key={l.id} direction="row" spacing={1} sx={{ alignItems: 'center', px: 0.5 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: l.kind === 'sites' ? '50%' : 0.5,
                  bgcolor: l.kind === 'sites' ? 'transparent' : `${l.color}55`,
                  border: `2px solid ${l.color}`,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ flex: 1 }} noWrap title={l.label}>
                {l.label}
              </Typography>
              <Switch
                size="small"
                checked={l.visible}
                onChange={(_e, v) => layerRegistry.setVisible(l.id, v)}
              />
            </Stack>
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
            מקרא סוגי אתרים
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ px: 0.5, pt: 0.5, flexWrap: 'wrap' }}>
            {SITE_TYPES.map((t) => (
              <Stack key={t} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: SITE_TYPE_COLOR[t] }}
                />
                <Typography variant="caption">{SITE_TYPE_LABEL[t]}</Typography>
              </Stack>
            ))}
            <Typography variant="caption" color="text.secondary">
              (שקוף = מתוכנן)
            </Typography>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}
