/** כלי גיאומטריה פשוטים. בגרסה האמיתית החישוב נעשה בשרת (או במנוע החיצוני). */
import type { Feature, Polygon, Position } from 'geojson';

const EARTH_RADIUS_KM = 6371.0088;
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** גבולות ישראל (קירוב) – לוולידציה של קואורדינטות */
export const ISRAEL_BOUNDS = { minLat: 29.45, maxLat: 33.35, minLng: 34.2, maxLng: 35.95 } as const;
export const ISRAEL_CENTER: [number, number] = [34.95, 31.6];

/** נקודת יעד ממרכז, מרחק ואזימוט (נוסחה כדורית) */
export function destination(
  lng: number,
  lat: number,
  distanceKm: number,
  bearingDeg: number,
): Position {
  const δ = distanceKm / EARTH_RADIUS_KM;
  const θ = toRad(bearingDeg);
  const φ1 = toRad(lat);
  const λ1 = toRad(lng);
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 =
    λ1 +
    Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return [toDeg(λ2), toDeg(φ2)];
}

/** מעגל כפוליגון של N נקודות (ברירת מחדל 64), טבעת סגורה */
export function circlePolygon(lng: number, lat: number, radiusKm: number, steps = 64): Polygon {
  const ring: Position[] = [];
  for (let i = 0; i < steps; i++) {
    ring.push(destination(lng, lat, radiusKm, (i * 360) / steps));
  }
  const first = ring[0];
  if (first) ring.push([first[0] ?? lng, first[1] ?? lat]);
  return { type: 'Polygon', coordinates: [ring] };
}

/** שטח טבעת בקמ"ר – הטלה שווה-מרחקים סביב מרכז הטבעת (מספיק לקירוב) */
export function ringAreaKm2(ring: Position[]): number {
  if (ring.length < 4) return 0;
  const lat0 = ring.reduce((s, p) => s + (p[1] ?? 0), 0) / ring.length;
  const kx = (Math.PI / 180) * EARTH_RADIUS_KM * Math.cos(toRad(lat0));
  const ky = (Math.PI / 180) * EARTH_RADIUS_KM;
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i];
    const b = ring[i + 1];
    if (!a || !b) continue;
    sum += (a[0] ?? 0) * kx * ((b[1] ?? 0) * ky) - (b[0] ?? 0) * kx * ((a[1] ?? 0) * ky);
  }
  return Math.abs(sum) / 2;
}

export function polygonAreaKm2(poly: Polygon): number {
  const outer = poly.coordinates[0];
  return outer ? ringAreaKm2(outer) : 0;
}

/**
 * רדיוס כיסוי (ק"מ) – נוסחה "צעצוע" לפרוטוטייפ בלבד:
 * גדל עם שורש ההספק ושורש הגובה, מוכפל במקדם מודל ההתפשטות.
 */
export function coverageRadiusKm(powerW: number, heightM: number, modelFactor = 1): number {
  const r = 1.5 + Math.sqrt(Math.max(powerW, 0)) * 0.3 + Math.sqrt(Math.max(heightM, 0)) * 0.7;
  return Math.round(r * modelFactor * 100) / 100;
}

export type BBox = [[number, number], [number, number]];

export function bboxOf(points: { lng: number; lat: number }[]): BBox | null {
  if (points.length === 0) return null;
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const p of points) {
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export function makeFeature<P>(geometry: Polygon, properties: P): Feature<Polygon, P> {
  return { type: 'Feature', geometry, properties };
}
