/** ה"שרת" המדומה: ניתוב בקשות לפי method + path. משקף את ה-REST API העתידי של NestJS. */
import type {
  CreateTaskInput,
  LoginResponse,
  Project,
  ProjectInput,
  Site,
  SiteInput,
} from '../types/domain';
import { hasErrors, validateProject, validateSite } from '../lib/validation';
import { MODELS } from '../lib/labels';
import { db, nextId, type TaskInternal } from './db';
import { advanceTask, toPublicTask } from './calcEngine';

export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export interface MockRequest {
  method: string;
  path: string;
  params: Record<string, string>;
  body: unknown;
  authorized: boolean;
}

type Handler = (req: MockRequest, match: string[]) => unknown;
interface Route {
  method: string;
  pattern: RegExp;
  handler: Handler;
  public?: boolean;
}

const asRecord = (b: unknown): Record<string, unknown> =>
  typeof b === 'object' && b !== null ? (b as Record<string, unknown>) : {};

const withCount = (p: Project): Project => ({
  ...p,
  siteCount: db.sites.filter((s) => s.projectId === p.id).length,
});

function findProject(id: string): Project {
  const p = db.projects.find((x) => x.id === id);
  if (!p) throw new HttpError(404, 'הפרויקט לא נמצא');
  return p;
}

function parseSiteInput(body: unknown): SiteInput {
  const b = asRecord(body);
  const errors = validateSite(b);
  if (hasErrors(errors)) throw new HttpError(400, 'נתוני האתר אינם תקינים', errors);
  return {
    name: String(b.name).trim(),
    type: b.type as SiteInput['type'],
    status: b.status as SiteInput['status'],
    lat: Number(b.lat),
    lng: Number(b.lng),
    heightM: Number(b.heightM),
    powerW: Number(b.powerW),
    frequencyMHz: Number(b.frequencyMHz),
  };
}

const routes: Route[] = [
  {
    method: 'post',
    pattern: /^\/auth\/login$/,
    public: true,
    handler: (req): LoginResponse => {
      const username = String(asRecord(req.body).username ?? '').trim();
      if (!username) throw new HttpError(400, 'יש להזין שם משתמש');
      return {
        token: `mock-token-${username}-${Date.now()}`,
        user: { username, displayName: username },
      };
    },
  },
  {
    method: 'get',
    pattern: /^\/projects$/,
    handler: (req): Project[] => {
      const q = (req.params.search ?? '').trim().toLowerCase();
      return db.projects
        .filter(
          (p) => !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
        )
        .map(withCount)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  },
  {
    method: 'post',
    pattern: /^\/projects$/,
    handler: (req): Project => {
      const b = asRecord(req.body);
      const errors = validateProject(b);
      if (hasErrors(errors)) throw new HttpError(400, 'נתוני הפרויקט אינם תקינים', errors);
      const input: ProjectInput = {
        name: String(b.name).trim(),
        description: String(b.description ?? '').trim(),
        region: b.region as ProjectInput['region'],
      };
      if (db.projects.some((p) => p.name === input.name))
        throw new HttpError(409, 'כבר קיים פרויקט בשם הזה');
      const project: Project = {
        ...input,
        id: nextId('p'),
        owner: 'אני',
        createdAt: new Date().toISOString(),
        siteCount: 0,
      };
      db.projects.push(project);
      return project;
    },
  },
  {
    method: 'get',
    pattern: /^\/projects\/([^/]+)$/,
    handler: (_req, [id = '']) => withCount(findProject(id)),
  },
  {
    method: 'get',
    pattern: /^\/projects\/([^/]+)\/sites$/,
    handler: (_req, [id = '']): Site[] => {
      findProject(id);
      return db.sites.filter((s) => s.projectId === id);
    },
  },
  {
    method: 'post',
    pattern: /^\/projects\/([^/]+)\/sites$/,
    handler: (req, [id = '']): Site => {
      findProject(id);
      const site: Site = {
        ...parseSiteInput(req.body),
        id: nextId('s'),
        projectId: id,
        updatedAt: new Date().toISOString(),
      };
      db.sites.push(site);
      return site;
    },
  },
  {
    method: 'put',
    pattern: /^\/sites\/([^/]+)$/,
    handler: (req, [id = '']): Site => {
      const idx = db.sites.findIndex((s) => s.id === id);
      const existing = db.sites[idx];
      if (!existing) throw new HttpError(404, 'האתר לא נמצא');
      const updated: Site = {
        ...existing,
        ...parseSiteInput(req.body),
        updatedAt: new Date().toISOString(),
      };
      db.sites[idx] = updated;
      return updated;
    },
  },
  {
    method: 'delete',
    pattern: /^\/sites\/([^/]+)$/,
    handler: (_req, [id = '']) => {
      const before = db.sites.length;
      db.sites = db.sites.filter((s) => s.id !== id);
      if (db.sites.length === before) throw new HttpError(404, 'האתר לא נמצא');
      return { ok: true };
    },
  },
  {
    method: 'get',
    pattern: /^\/projects\/([^/]+)\/tasks$/,
    handler: (_req, [id = '']) => {
      findProject(id);
      return db.tasks
        .filter((t) => t.projectId === id)
        .map((t) => {
          advanceTask(t);
          return toPublicTask(t);
        })
        .sort((a, b) => b.runNumber - a.runNumber);
    },
  },
  {
    method: 'post',
    pattern: /^\/projects\/([^/]+)\/tasks$/,
    handler: (req, [id = '']) => {
      findProject(id);
      const b = asRecord(req.body) as Partial<CreateTaskInput>;
      const model = MODELS.includes(b.model as CreateTaskInput['model'])
        ? (b.model as CreateTaskInput['model'])
        : 'default';
      const snapshot = db.sites.filter((s) => s.projectId === id).map((s) => ({ ...s }));
      if (snapshot.length === 0) throw new HttpError(422, 'אין אתרים בפרויקט – אין מה לחשב');
      const runNumber = db.tasks.filter((t) => t.projectId === id).length + 1;
      const task: TaskInternal = {
        id: nextId('t'),
        projectId: id,
        runNumber,
        model,
        status: 'queued',
        progress: 0,
        siteCount: snapshot.length,
        createdAt: new Date().toISOString(),
        finishedAt: null,
        error: null,
        startedAtMs: Date.now(),
        durationMs: 4000 + snapshot.length * 30,
        willFail: Math.random() < 0.1,
        siteSnapshot: snapshot,
      };
      db.tasks.push(task);
      return toPublicTask(task);
    },
  },
  {
    method: 'get',
    pattern: /^\/tasks\/([^/]+)$/,
    handler: (_req, [id = '']) => {
      const t = db.tasks.find((x) => x.id === id);
      if (!t) throw new HttpError(404, 'המשימה לא נמצאה');
      advanceTask(t);
      return toPublicTask(t);
    },
  },
  {
    method: 'get',
    pattern: /^\/tasks\/([^/]+)\/result$/,
    handler: (_req, [id = '']) => {
      const t = db.tasks.find((x) => x.id === id);
      if (!t) throw new HttpError(404, 'המשימה לא נמצאה');
      advanceTask(t);
      const r = db.results.get(id);
      if (!r) throw new HttpError(409, 'למשימה עדיין אין תוצאה');
      return r;
    },
  },
];

export function handle(req: MockRequest): unknown {
  for (const r of routes) {
    if (r.method !== req.method) continue;
    const m = r.pattern.exec(req.path);
    if (!m) continue;
    if (!r.public && !req.authorized) throw new HttpError(401, 'נדרשת התחברות');
    return r.handler(req, m.slice(1));
  }
  throw new HttpError(404, `נתיב לא קיים: ${req.method.toUpperCase()} ${req.path}`);
}
