/**
 * עטיפת MapLibre נקייה עם useRef/useEffect (ללא ספריית wrapper).
 * אחריות: יצירת המפה, אינטראקציות (hover/click/popup), בחירה ו-fitBounds.
 * השכבות עצמן מנוהלות ע"י layerRegistry.
 */
import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import {
  Map as MlMap,
  NavigationControl,
  Popup,
  ScaleControl,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from 'maplibre-gl';
import { BASE_STYLE_URL } from './maplibreSetup';
import { layerRegistry } from './layerRegistry';
import { SITES_CIRCLE_LAYER, SITES_LAYER_ID, sitesLayerDefinition } from './layers';
import type { Site } from '../../types/domain';
import { bboxOf, ISRAEL_CENTER } from '../../lib/geo';
import {
  formatNumber,
  SITE_STATUS_LABEL,
  SITE_TYPE_COLOR,
  SITE_TYPE_LABEL,
} from '../../lib/labels';

export interface MapSelection {
  id: string | null;
  source: 'map' | 'grid';
}

interface Props {
  sites: Site[];
  selection: MapSelection;
  onSelect: (id: string | null) => void;
  onEdit: (site: Site) => void;
  addMode: boolean;
  onPickLocation: (lng: number, lat: number) => void;
  /** מפתח ל-fitBounds אוטומטי (מזהה פרויקט) */
  fitKey: string;
  /** מונה – כל שינוי מבצע fitBounds מחדש */
  fitSignal: number;
}

function buildPopup(site: Site, onEdit: () => void): HTMLElement {
  const root = document.createElement('div');
  root.dir = 'rtl';
  root.style.fontFamily = 'Heebo, sans-serif';
  root.style.minWidth = '190px';
  const title = document.createElement('div');
  title.style.fontWeight = '700';
  title.style.fontSize = '14px';
  title.style.borderInlineStart = `4px solid ${SITE_TYPE_COLOR[site.type]}`;
  title.style.paddingInlineStart = '6px';
  title.textContent = site.name;
  root.appendChild(title);
  const rows: [string, string][] = [
    ['סוג', SITE_TYPE_LABEL[site.type]],
    ['סטטוס', SITE_STATUS_LABEL[site.status]],
    ['גובה', `${site.heightM} מ׳`],
    ['הספק', `${formatNumber(site.powerW)} W`],
    ['תדר', `${formatNumber(site.frequencyMHz)} MHz`],
    ['מיקום', `${site.lat.toFixed(4)}, ${site.lng.toFixed(4)}`],
  ];
  const table = document.createElement('div');
  table.style.marginTop = '6px';
  table.style.fontSize = '12px';
  for (const [k, v] of rows) {
    const row = document.createElement('div');
    const kEl = document.createElement('span');
    kEl.style.color = '#5b6b8c';
    kEl.textContent = `${k}: `;
    const vEl = document.createElement('span');
    vEl.textContent = v;
    row.append(kEl, vEl);
    table.appendChild(row);
  }
  root.appendChild(table);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'עריכת אתר';
  btn.style.cssText =
    'margin-top:8px;width:100%;border:0;border-radius:6px;padding:5px;background:#2F5BEA;color:#fff;cursor:pointer;font-family:inherit';
  btn.addEventListener('click', onEdit);
  root.appendChild(btn);
  return root;
}

export function MapView({
  sites,
  selection,
  onSelect,
  onEdit,
  addMode,
  onPickLocation,
  fitKey,
  fitSignal,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const hoverIdRef = useRef<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const fittedKeyRef = useRef<string | null>(null);
  const fitSignalRef = useRef(0);
  const [ready, setReady] = useState(false);

  // הפניות לערכים העדכניים – כדי שה-handlers של המפה (שנרשמים פעם אחת) לא יתיישנו
  const latest = useRef({ sites, onSelect, onEdit, addMode, onPickLocation });
  useEffect(() => {
    latest.current = { sites, onSelect, onEdit, addMode, onPickLocation };
  });

  // יצירת המפה – פעם אחת
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = new MlMap({
      container,
      style: BASE_STYLE_URL,
      center: ISRAEL_CENTER,
      zoom: 7,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ visualizePitch: false }), 'top-left');
    map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left');

    const setHover = (id: string | null) => {
      if (hoverIdRef.current === id) return;
      if (hoverIdRef.current && map.getSource(SITES_LAYER_ID))
        map.setFeatureState({ source: SITES_LAYER_ID, id: hoverIdRef.current }, { hover: false });
      hoverIdRef.current = id;
      if (id) map.setFeatureState({ source: SITES_LAYER_ID, id }, { hover: true });
    };

    const featureId = (f: MapGeoJSONFeature | undefined): string | null =>
      f && typeof f.properties.id === 'string' ? f.properties.id : null;

    map.on('load', () => {
      layerRegistry.attach(map);
      setReady(true);
    });

    map.on('mousemove', SITES_CIRCLE_LAYER, (e) => {
      setHover(featureId(e.features?.[0]));
      if (!latest.current.addMode) map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', SITES_CIRCLE_LAYER, () => {
      setHover(null);
      map.getCanvas().style.cursor = latest.current.addMode ? 'crosshair' : '';
    });

    map.on('click', (e: MapMouseEvent) => {
      const { addMode: adding, onPickLocation: pick, onSelect: select } = latest.current;
      if (adding) {
        pick(Math.round(e.lngLat.lng * 1e5) / 1e5, Math.round(e.lngLat.lat * 1e5) / 1e5);
        return;
      }
      const hit = map.getLayer(SITES_CIRCLE_LAYER)
        ? map.queryRenderedFeatures(e.point, { layers: [SITES_CIRCLE_LAYER] })[0]
        : undefined;
      const id = featureId(hit);
      if (id) select(id);
    });

    return () => {
      layerRegistry.detach(map);
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // רישום שכבת האתרים בכל שינוי נתונים
  useEffect(() => {
    if (!ready) return;
    layerRegistry.register(sitesLayerDefinition(sites));
  }, [ready, sites]);

  // סמן העכבר במצב "הוספה בלחיצה"
  useEffect(() => {
    const map = mapRef.current;
    if (map) map.getCanvas().style.cursor = addMode ? 'crosshair' : '';
  }, [addMode, ready]);

  // fitBounds אוטומטי פעם אחת לכל פרויקט + לפי בקשה
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || sites.length === 0) return;
    const auto = fittedKeyRef.current !== fitKey;
    if (!auto && fitSignal === fitSignalRef.current) return;
    fitSignalRef.current = fitSignal;
    const bbox = bboxOf(sites);
    if (!bbox) return;
    map.fitBounds(bbox, { padding: 60, maxZoom: 12, duration: auto ? 0 : 800 });
    fittedKeyRef.current = fitKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- מכוון: רק בהחלפת פרויקט/בקשה מפורשת
  }, [ready, fitKey, fitSignal, sites.length > 0]);

  // בחירה: feature-state + popup + flyTo (כשהבחירה הגיעה מהטבלה)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getSource(SITES_LAYER_ID)) return;
    const prev = selectedIdRef.current;
    if (prev && prev !== selection.id)
      map.setFeatureState({ source: SITES_LAYER_ID, id: prev }, { selected: false });
    selectedIdRef.current = selection.id;
    popupRef.current?.remove();
    popupRef.current = null;
    const site = selection.id ? sites.find((s) => s.id === selection.id) : undefined;
    if (!site) return;
    map.setFeatureState({ source: SITES_LAYER_ID, id: site.id }, { selected: true });
    const popup = new Popup({ offset: 14, closeButton: true, maxWidth: '260px' })
      .setLngLat([site.lng, site.lat])
      .setDOMContent(buildPopup(site, () => latest.current.onEdit(site)))
      .addTo(map);
    popup.on('close', () => {
      if (popupRef.current === popup && selectedIdRef.current === site.id)
        latest.current.onSelect(null);
    });
    popupRef.current = popup;
    if (selection.source === 'grid') {
      map.flyTo({ center: [site.lng, site.lat], zoom: Math.max(map.getZoom(), 11.5), speed: 1.4 });
    }
  }, [selection, sites, ready]);

  // הערה: maplibre-gl.css מגדיר ל-container ‏position: relative, ולכן ה-container הוא div פנימי בגודל 100%
  return (
    <Box sx={{ position: 'absolute', inset: 0 }}>
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
    </Box>
  );
}
