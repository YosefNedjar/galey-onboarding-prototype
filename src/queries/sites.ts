import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sitesApi } from '../api/endpoints';
import type { Site, SiteInput } from '../types/domain';
import { notify } from '../lib/notify';
import { errorMessage } from '../api/http';
import { queryKeys } from './keys';

export const siteQueries = {
  byProject: (projectId: string) =>
    queryOptions({
      queryKey: queryKeys.sites.byProject(projectId),
      queryFn: ({ signal }) => sitesApi.listByProject(projectId, signal),
    }),
};

export const useSitesQuery = (projectId: string) => useQuery(siteQueries.byProject(projectId));

/** אחרי שינוי באתרים – מרעננים גם את רשימת האתרים וגם את הפרויקט (siteCount) */
function invalidateProjectSites(qc: ReturnType<typeof useQueryClient>, projectId: string) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: queryKeys.sites.byProject(projectId) }),
    qc.invalidateQueries({ queryKey: queryKeys.projects.all }),
  ]);
}

export function useCreateSite(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SiteInput) => sitesApi.create(projectId, input),
    onSuccess: () => invalidateProjectSites(qc, projectId),
  });
}

export function useUpdateSite(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SiteInput }) => sitesApi.update(id, input),
    onSuccess: (updated) => {
      // עדכון מיידי של ה-cache, ואז invalidation לסנכרון מלא
      qc.setQueryData<Site[]>(queryKeys.sites.byProject(projectId), (old) =>
        old?.map((s) => (s.id === updated.id ? updated : s)),
      );
      return invalidateProjectSites(qc, projectId);
    },
  });
}

/** מחיקה אופטימית: מסירים מה-cache מיד, ומשחזרים (rollback) אם השרת נכשל */
export function useDeleteSite(projectId: string) {
  const qc = useQueryClient();
  const key = queryKeys.sites.byProject(projectId);
  return useMutation({
    mutationFn: (site: Site) => sitesApi.remove(site.id),
    onMutate: async (site) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Site[]>(key);
      qc.setQueryData<Site[]>(key, (old) => old?.filter((s) => s.id !== site.id));
      return { previous };
    },
    onError: (err, site, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
      notify.error(`מחיקת "${site.name}" נכשלה ושוחזרה: ${errorMessage(err)}`);
    },
    onSuccess: (_data, site) => notify.success(`האתר "${site.name}" נמחק`),
    onSettled: () => invalidateProjectSites(qc, projectId),
  });
}
