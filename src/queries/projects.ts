import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/endpoints';
import type { ProjectFilters, ProjectInput } from '../types/domain';
import { queryKeys } from './keys';

export const projectQueries = {
  list: (filters: ProjectFilters) =>
    queryOptions({
      queryKey: queryKeys.projects.list(filters),
      queryFn: ({ signal }) => projectsApi.list(filters, signal),
      placeholderData: (prev) => prev,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.projects.detail(id),
      queryFn: ({ signal }) => projectsApi.get(id, signal),
    }),
};

export const useProjectsQuery = (filters: ProjectFilters) => useQuery(projectQueries.list(filters));
export const useProjectQuery = (id: string) => useQuery(projectQueries.detail(id));

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectInput) => projectsApi.create(input),
    onSuccess: (project) => {
      qc.setQueryData(queryKeys.projects.detail(project.id), project);
      return qc.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
}
