/**
 * Query Key Factory – מקור אמת יחיד למפתחות ה-cache.
 * היררכיה מאפשרת invalidation ברמות שונות (כל הפרויקטים / רשימה מסוננת / פרויקט בודד).
 */
import type { ProjectFilters } from '../types/domain';

export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: ProjectFilters) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  sites: {
    all: ['sites'] as const,
    byProject: (projectId: string) => [...queryKeys.sites.all, 'project', projectId] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    byProject: (projectId: string) => [...queryKeys.tasks.all, 'project', projectId] as const,
    detail: (id: string) => [...queryKeys.tasks.all, 'detail', id] as const,
    result: (id: string) => [...queryKeys.tasks.all, 'result', id] as const,
  },
};
