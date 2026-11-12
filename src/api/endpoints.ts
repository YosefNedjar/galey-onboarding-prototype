/** פונקציות API טיפוסיות. ה-UI לא קורא להן ישירות – רק דרך hooks של React Query (src/queries). */
import type {
  CalcResult,
  CalcTask,
  CreateTaskInput,
  LoginResponse,
  Project,
  ProjectFilters,
  ProjectInput,
  Site,
  SiteInput,
} from '../types/domain';
import { http } from './http';

export const authApi = {
  login: (username: string) =>
    http.post<LoginResponse>('/auth/login', { username }).then((r) => r.data),
};

export const projectsApi = {
  list: (filters: ProjectFilters, signal?: AbortSignal) =>
    http
      .get<Project[]>('/projects', {
        params: filters.search ? { search: filters.search } : {},
        signal,
      })
      .then((r) => r.data),
  get: (id: string, signal?: AbortSignal) =>
    http.get<Project>(`/projects/${id}`, { signal }).then((r) => r.data),
  create: (input: ProjectInput) => http.post<Project>('/projects', input).then((r) => r.data),
};

export const sitesApi = {
  listByProject: (projectId: string, signal?: AbortSignal) =>
    http.get<Site[]>(`/projects/${projectId}/sites`, { signal }).then((r) => r.data),
  create: (projectId: string, input: SiteInput) =>
    http.post<Site>(`/projects/${projectId}/sites`, input).then((r) => r.data),
  update: (id: string, input: SiteInput) =>
    http.put<Site>(`/sites/${id}`, input).then((r) => r.data),
  remove: (id: string) => http.delete<{ ok: true }>(`/sites/${id}`).then((r) => r.data),
};

export const tasksApi = {
  listByProject: (projectId: string, signal?: AbortSignal) =>
    http.get<CalcTask[]>(`/projects/${projectId}/tasks`, { signal }).then((r) => r.data),
  create: (projectId: string, input: CreateTaskInput) =>
    http.post<CalcTask>(`/projects/${projectId}/tasks`, input).then((r) => r.data),
  get: (id: string, signal?: AbortSignal) =>
    http.get<CalcTask>(`/tasks/${id}`, { signal }).then((r) => r.data),
  result: (id: string, signal?: AbortSignal) =>
    http.get<CalcResult>(`/tasks/${id}/result`, { signal }).then((r) => r.data),
};
