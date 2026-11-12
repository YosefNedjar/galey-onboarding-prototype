/**
 * ולידציה משותפת ללקוח ול"שרת" (mock).
 * בגרסה האמיתית: class-validator ב-DTO של NestJS + סכמה מקבילה בלקוח (למשל zod).
 */
import type { ProjectInput, SiteInput } from '../types/domain';
import { ISRAEL_BOUNDS } from './geo';
import { REGIONS, SITE_STATUSES, SITE_TYPES } from './labels';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

function inRange(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
}

export function validateSite(
  input: Partial<Record<keyof SiteInput, unknown>>,
): FieldErrors<SiteInput> {
  const e: FieldErrors<SiteInput> = {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name.length < 2 || name.length > 60) e.name = 'שם חובה, 2–60 תווים';
  if (!SITE_TYPES.includes(input.type as SiteInput['type'])) e.type = 'יש לבחור סוג';
  if (!SITE_STATUSES.includes(input.status as SiteInput['status'])) e.status = 'יש לבחור סטטוס';
  if (!inRange(input.lat, ISRAEL_BOUNDS.minLat, ISRAEL_BOUNDS.maxLat))
    e.lat = `קו רוחב בין ${ISRAEL_BOUNDS.minLat} ל-${ISRAEL_BOUNDS.maxLat}`;
  if (!inRange(input.lng, ISRAEL_BOUNDS.minLng, ISRAEL_BOUNDS.maxLng))
    e.lng = `קו אורך בין ${ISRAEL_BOUNDS.minLng} ל-${ISRAEL_BOUNDS.maxLng}`;
  if (!inRange(input.heightM, 1, 300)) e.heightM = 'גובה 1–300 מ׳';
  if (!inRange(input.powerW, 1, 5000)) e.powerW = 'הספק 1–5000 W';
  if (!inRange(input.frequencyMHz, 30, 6000)) e.frequencyMHz = 'תדר 30–6000 MHz';
  return e;
}

export function validateProject(
  input: Partial<Record<keyof ProjectInput, unknown>>,
): FieldErrors<ProjectInput> {
  const e: FieldErrors<ProjectInput> = {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name.length < 3 || name.length > 80) e.name = 'שם חובה, 3–80 תווים';
  if (typeof input.description === 'string' && input.description.length > 300)
    e.description = 'עד 300 תווים';
  if (!REGIONS.includes(input.region as ProjectInput['region'])) e.region = 'יש לבחור אזור';
  return e;
}

export const hasErrors = (e: object): boolean => Object.keys(e).length > 0;
