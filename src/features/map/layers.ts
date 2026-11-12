/** הגדרות השכבות (style specs) – אתרים וכיסוי */
import type { FeatureCollection, Point } from 'geojson';
import type { ExpressionSpecification } from 'maplibre-gl';
import type { CalcResult, Site, SiteType } from '../../types/domain';
import { SITE_TYPE_COLOR } from '../../lib/labels';
import type { LayerDefinition } from './layerRegistry';

export const SITES_LAYER_ID = 'sites';
export const SITES_CIRCLE_LAYER = 'sites-circle';
export const SITES_LABEL_LAYER = 'sites-label';

export interface SiteFeatureProps {
  id: string;
  name: string;
  type: SiteType;
  status: Site['status'];
}

export function sitesToGeoJSON(sites: Site[]): FeatureCollection<Point, SiteFeatureProps> {
  return {
    type: 'FeatureCollection',
    features: sites.map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, type: s.type, status: s.status },
    })),
  };
}

const isSelected: ExpressionSpecification = ['boolean', ['feature-state', 'selected'], false];
const isHover: ExpressionSpecification = ['boolean', ['feature-state', 'hover'], false];

export function sitesLayerDefinition(sites: Site[]): LayerDefinition {
  return {
    id: SITES_LAYER_ID,
    label: 'אתרי תקשורת',
    kind: 'sites',
    color: SITE_TYPE_COLOR.antenna,
    data: sitesToGeoJSON(sites),
    promoteId: 'id',
    layers: [
      {
        id: SITES_CIRCLE_LAYER,
        type: 'circle',
        source: SITES_LAYER_ID,
        paint: {
          // data-driven: צבע לפי סוג האתר
          'circle-color': [
            'match',
            ['get', 'type'],
            'antenna',
            SITE_TYPE_COLOR.antenna,
            'relay',
            SITE_TYPE_COLOR.relay,
            'station',
            SITE_TYPE_COLOR.station,
            '#888888',
          ],
          // feature-state: הדגשה ב-hover ובבחירה
          'circle-radius': ['case', isSelected, 11, isHover, 9, 6],
          'circle-stroke-color': ['case', isSelected, '#0B1B3F', isHover, '#22D3EE', '#FFFFFF'],
          'circle-stroke-width': ['case', isSelected, 3, isHover, 3, 1.5],
          'circle-opacity': ['match', ['get', 'status'], 'planned', 0.55, 1],
        },
      },
      {
        id: SITES_LABEL_LAYER,
        type: 'symbol',
        source: SITES_LAYER_ID,
        minzoom: 10.5,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 12,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
        },
        paint: { 'text-color': '#0B1B3F', 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 },
      },
    ],
  };
}

export function coverageLayerDefinition(
  id: string,
  label: string,
  color: string,
  result: CalcResult,
): LayerDefinition {
  return {
    id,
    label,
    kind: 'coverage',
    color,
    data: result.coverage,
    layers: [
      {
        id: `${id}-fill`,
        type: 'fill',
        source: id,
        paint: { 'fill-color': color, 'fill-opacity': 0.1 },
      },
      {
        id: `${id}-outline`,
        type: 'line',
        source: id,
        paint: { 'line-color': color, 'line-width': 1.5, 'line-opacity': 0.9 },
      },
    ],
  };
}
