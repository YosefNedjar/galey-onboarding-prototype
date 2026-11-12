import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/endpoints';
import type { CalcTask, CreateTaskInput } from '../types/domain';
import { queryKeys } from './keys';

const isActive = (t: CalcTask) => t.status === 'queued' || t.status === 'running';
const POLL_MS = 1000;

export const taskQueries = {
  /** polling: refetchInterval פעיל רק כל עוד יש משימה בתור/רצה – ונעצר כשהכל הסתיים */
  byProject: (projectId: string) =>
    queryOptions({
      queryKey: queryKeys.tasks.byProject(projectId),
      queryFn: ({ signal }) => tasksApi.listByProject(projectId, signal),
      refetchInterval: (query) => (query.state.data?.some(isActive) ? POLL_MS : false),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.tasks.detail(id),
      queryFn: ({ signal }) => tasksApi.get(id, signal),
      refetchInterval: (query) =>
        query.state.data && isActive(query.state.data) ? POLL_MS : false,
    }),
  /** תוצאה של משימה שהסתיימה לא משתנה – staleTime אינסופי */
  result: (id: string) =>
    queryOptions({
      queryKey: queryKeys.tasks.result(id),
      queryFn: ({ signal }) => tasksApi.result(id, signal),
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
    }),
};

export const useTasksQuery = (projectId: string) => useQuery(taskQueries.byProject(projectId));

export function useTaskResultQuery(task: CalcTask | undefined) {
  return useQuery({
    ...taskQueries.result(task?.id ?? 'none'),
    enabled: task?.status === 'done',
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(projectId, input),
    onSuccess: (task) => {
      qc.setQueryData<CalcTask[]>(queryKeys.tasks.byProject(projectId), (old) => [
        task,
        ...(old ?? []),
      ]);
      return qc.invalidateQueries({ queryKey: queryKeys.tasks.byProject(projectId) });
    },
  });
}
