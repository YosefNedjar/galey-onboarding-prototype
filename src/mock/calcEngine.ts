/** "מנוע חישוב" מדומה. בגרסה האמיתית: שירות חיצוני שה-NestJS קורא לו, והתוצאות נשמרות ב-PostgreSQL. */
import type { CalcResult, CalcTask, CoverageProps, PropagationModel } from '../types/domain';
import { circlePolygon, coverageRadiusKm, makeFeature, polygonAreaKm2 } from '../lib/geo';
import { db, type TaskInternal } from './db';

const QUEUE_MS = 1500;

export const MODEL_FACTOR: Record<PropagationModel, number> = {
  'free-space': 1.2,
  default: 1,
  'hata-urban': 0.8,
};

/** מקדם את סטטוס המשימה לפי הזמן שעבר מאז יצירתה */
export function advanceTask(t: TaskInternal, now = Date.now()): void {
  if (t.status === 'done' || t.status === 'failed') return;
  const elapsed = now - t.startedAtMs;
  if (elapsed < QUEUE_MS) {
    t.status = 'queued';
    t.progress = 0;
    return;
  }
  const pct = Math.min(100, Math.round(((elapsed - QUEUE_MS) / t.durationMs) * 100));
  if (t.willFail && pct >= 60) {
    t.status = 'failed';
    t.progress = 60;
    t.error = 'מנוע החישוב החזיר שגיאה (סימולציה): timeout בתא 7/12';
    t.finishedAt = new Date(now).toISOString();
    return;
  }
  if (pct >= 100) {
    t.status = 'done';
    t.progress = 100;
    t.finishedAt = new Date(now).toISOString();
    db.results.set(t.id, computeResult(t));
    return;
  }
  t.status = 'running';
  t.progress = pct;
}

export function computeResult(t: TaskInternal): CalcResult {
  const factor = MODEL_FACTOR[t.model];
  const features = t.siteSnapshot.map((s) => {
    const radiusKm = coverageRadiusKm(s.powerW, s.heightM, factor);
    const geometry = circlePolygon(s.lng, s.lat, radiusKm, 64);
    const props: CoverageProps = {
      siteId: s.id,
      siteName: s.name,
      siteType: s.type,
      radiusKm,
      areaKm2: Math.round(polygonAreaKm2(geometry) * 10) / 10,
    };
    return makeFeature(geometry, props);
  });
  const total = features.reduce((sum, f) => sum + f.properties.areaKm2, 0);
  const avg = features.length
    ? features.reduce((sum, f) => sum + f.properties.radiusKm, 0) / features.length
    : 0;
  return {
    taskId: t.id,
    summary: {
      sitesCount: features.length,
      totalAreaKm2: Math.round(total),
      avgRadiusKm: Math.round(avg * 100) / 100,
    },
    coverage: { type: 'FeatureCollection', features },
  };
}

export function toPublicTask(t: TaskInternal): CalcTask {
  return {
    id: t.id,
    projectId: t.projectId,
    runNumber: t.runNumber,
    model: t.model,
    status: t.status,
    progress: t.progress,
    siteCount: t.siteCount,
    createdAt: t.createdAt,
    finishedAt: t.finishedAt,
    error: t.error,
  };
}
