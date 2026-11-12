/** "מסד נתונים" בזיכרון. מתאפס ברענון הדף. */
import type { CalcResult, CalcTask, Project, Site } from '../types/domain';
import { seedData } from './seed';

const seeded = seedData();

export interface TaskInternal extends CalcTask {
  /** זמן התחלה במילישניות – הסטטוס מחושב לפי הזמן שעבר */
  startedAtMs: number;
  durationMs: number;
  willFail: boolean;
  siteSnapshot: Site[];
}

export const db = {
  projects: seeded.projects as Project[],
  sites: seeded.sites as Site[],
  tasks: [] as TaskInternal[],
  results: new Map<string, CalcResult>(),
};

let idCounter = 1000;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
