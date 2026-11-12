/** קומפוננטות "בלתי נראות" שרושמות שכבות כיסוי ב-LayerRegistry לפי מצב התצוגה */
import { useEffect } from 'react';
import type { CalcTask } from '../../types/domain';
import { useTaskResultQuery } from '../../queries/tasks';
import { layerRegistry } from '../map/layerRegistry';
import { coverageLayerDefinition } from '../map/layers';
import { COVERAGE_COLORS, isComparing, type CoverageView } from './coverageView';

function CoverageLayer({ task, role, color }: { task: CalcTask; role: string; color: string }) {
  const { data } = useTaskResultQuery(task);
  const id = `coverage-${role}-${task.id}`;
  useEffect(() => {
    if (!data) return;
    const prefix = role === 'single' ? 'כיסוי' : `השוואה ${role.toUpperCase()}`;
    layerRegistry.register(
      coverageLayerDefinition(id, `${prefix} · ריצה #${task.runNumber}`, color, data),
    );
    return () => layerRegistry.unregister(id);
  }, [data, id, color, role, task.runNumber]);
  return null;
}

export function CoverageLayers({ tasks, view }: { tasks: CalcTask[]; view: CoverageView }) {
  const byId = (id: string | null) =>
    id ? tasks.find((t) => t.id === id && t.status === 'done') : undefined;
  if (isComparing(view)) {
    const a = byId(view.compareA);
    const b = byId(view.compareB);
    return (
      <>
        {a && <CoverageLayer task={a} role="a" color={COVERAGE_COLORS.a} />}
        {b && <CoverageLayer task={b} role="b" color={COVERAGE_COLORS.b} />}
      </>
    );
  }
  const single = byId(view.shownTaskId);
  return single ? (
    <CoverageLayer task={single} role="single" color={COVERAGE_COLORS.single} />
  ) : null;
}
