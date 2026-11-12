import type { PropagationModel, Region, SiteStatus, SiteType, TaskStatus } from '../types/domain';

export const SITE_TYPE_LABEL: Record<SiteType, string> = {
  antenna: 'אנטנה',
  relay: 'ממסר',
  station: 'תחנה',
};

/** צבעי סוגי אתרים – משמשים גם במפה (data-driven expression) וגם ב-UI */
export const SITE_TYPE_COLOR: Record<SiteType, string> = {
  antenna: '#2F5BEA',
  relay: '#0EA5C6',
  station: '#A21CAF',
};

export const SITE_STATUS_LABEL: Record<SiteStatus, string> = {
  active: 'פעיל',
  planned: 'מתוכנן',
};

export const REGION_LABEL: Record<Region, string> = {
  north: 'צפון',
  center: 'מרכז',
  south: 'דרום',
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  queued: 'בתור',
  running: 'רץ',
  done: 'הסתיים',
  failed: 'נכשל',
};

export const MODEL_LABEL: Record<PropagationModel, string> = {
  'free-space': 'Free-space (אופטימי)',
  default: 'ברירת מחדל',
  'hata-urban': 'Hata עירוני (שמרני)',
};

export const SITE_TYPES: SiteType[] = ['antenna', 'relay', 'station'];
export const SITE_STATUSES: SiteStatus[] = ['active', 'planned'];
export const REGIONS: Region[] = ['north', 'center', 'south'];
export const MODELS: PropagationModel[] = ['default', 'free-space', 'hata-urban'];

export function formatNumber(n: number, digits = 0): string {
  return n.toLocaleString('he-IL', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
