/**
 * מודל הדומיין המשותף.
 * בגרסה האמיתית הקובץ הזה עובר לחבילת types משותפת בין client ל-server (NestJS).
 */
import type { FeatureCollection, Polygon } from 'geojson';

export type SiteType = 'antenna' | 'relay' | 'station';
export type SiteStatus = 'active' | 'planned';
export type Region = 'north' | 'center' | 'south';

export interface Site {
  id: string;
  projectId: string;
  name: string;
  type: SiteType;
  lat: number;
  lng: number;
  heightM: number;
  powerW: number;
  frequencyMHz: number;
  status: SiteStatus;
  updatedAt: string;
}

/** מה שהלקוח שולח ביצירה / עדכון (DTO) */
export type SiteInput = Omit<Site, 'id' | 'projectId' | 'updatedAt'>;

export interface Project {
  id: string;
  name: string;
  description: string;
  region: Region;
  owner: string;
  createdAt: string;
  siteCount: number;
}

export type ProjectInput = Pick<Project, 'name' | 'description' | 'region'>;

export interface ProjectFilters {
  search: string;
}

export type TaskStatus = 'queued' | 'running' | 'done' | 'failed';
export type PropagationModel = 'free-space' | 'default' | 'hata-urban';

export interface CalcTask {
  id: string;
  projectId: string;
  runNumber: number;
  model: PropagationModel;
  status: TaskStatus;
  /** 0-100 */
  progress: number;
  siteCount: number;
  createdAt: string;
  finishedAt: string | null;
  error: string | null;
}

export interface CreateTaskInput {
  model: PropagationModel;
}

export interface CoverageProps {
  siteId: string;
  siteName: string;
  siteType: SiteType;
  radiusKm: number;
  areaKm2: number;
}

export interface CalcResultSummary {
  sitesCount: number;
  /** סכום שטחי הכיסוי (חפיפות נספרות פעמיים) – קירוב */
  totalAreaKm2: number;
  avgRadiusKm: number;
}

export interface CalcResult {
  taskId: string;
  summary: CalcResultSummary;
  coverage: FeatureCollection<Polygon, CoverageProps>;
}

export interface User {
  username: string;
  displayName: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
