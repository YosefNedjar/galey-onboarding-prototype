/**
 * LayerRegistry – מודול פשוט שמחזיק את כל השכבות "העסקיות" שעל המפה (אתרים, תוצאות כיסוי),
 * דואג להוסיף/לעדכן/להסיר אותן ב-MapLibre, ומאפשר ל-UI (פאנל שכבות) להירשם לשינויים.
 * כך קומפוננטות React לא מדברות ישירות עם ה-map – הן רק רושמות שכבה.
 */
import type { GeoJSONSource, LayerSpecification, Map as MlMap } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';

export type LayerKind = 'sites' | 'coverage';

export interface LayerDefinition {
  /** מזהה השכבה – משמש גם כמזהה ה-source */
  id: string;
  label: string;
  kind: LayerKind;
  color: string;
  data: FeatureCollection;
  promoteId?: string;
  /** שכבות style בפועל (fill/line/circle/symbol) שכולן מצביעות על source = id */
  layers: LayerSpecification[];
}

export interface RegisteredLayer extends LayerDefinition {
  visible: boolean;
}

type Listener = () => void;

/** השוואה זולה בין ה-paint הקיים במפה לזה המבוקש */
function layerChanged(map: MlMap, layer: LayerSpecification): boolean {
  if (!('paint' in layer) || !layer.paint) return false;
  const current = map.getStyle().layers.find((l) => l.id === layer.id);
  const currentPaint = current && 'paint' in current ? current.paint : undefined;
  return JSON.stringify(currentPaint ?? {}) !== JSON.stringify(layer.paint);
}

class LayerRegistry {
  private entries = new Map<string, RegisteredLayer>();
  private map: MlMap | null = null;
  private listeners = new Set<Listener>();
  private snapshot: readonly RegisteredLayer[] = [];

  attach(map: MlMap) {
    this.map = map;
    this.entries.forEach((e) => this.apply(e));
  }

  detach(map: MlMap) {
    if (this.map === map) this.map = null;
  }

  register(def: LayerDefinition, visible?: boolean) {
    const prev = this.entries.get(def.id);
    const entry: RegisteredLayer = { ...def, visible: visible ?? prev?.visible ?? true };
    this.entries.set(def.id, entry);
    this.apply(entry);
    this.emit();
  }

  unregister(id: string) {
    const entry = this.entries.get(id);
    if (!entry) return;
    this.entries.delete(id);
    const map = this.map;
    if (map) {
      entry.layers.forEach((l) => {
        if (map.getLayer(l.id)) map.removeLayer(l.id);
      });
      if (map.getSource(id)) map.removeSource(id);
    }
    this.emit();
  }

  /** מסיר את כל השכבות (למשל ביציאה מפרויקט) */
  reset() {
    [...this.entries.keys()].forEach((id) => this.unregister(id));
  }

  setVisible(id: string, visible: boolean) {
    const entry = this.entries.get(id);
    if (!entry) return;
    entry.visible = visible;
    this.apply(entry);
    this.emit();
  }

  get(id: string): RegisteredLayer | undefined {
    return this.entries.get(id);
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };

  getSnapshot = (): readonly RegisteredLayer[] => this.snapshot;

  private emit() {
    this.snapshot = [...this.entries.values()];
    this.listeners.forEach((l) => l());
  }

  /** שכבות כיסוי נכנסות מתחת לשכבת האתרים כדי שהנקודות יישארו לחיצות */
  private beforeIdFor(entry: RegisteredLayer): string | undefined {
    if (entry.kind !== 'coverage' || !this.map) return undefined;
    for (const e of this.entries.values()) {
      if (e.kind === 'sites') {
        const first = e.layers.find((l) => this.map?.getLayer(l.id));
        if (first) return first.id;
      }
    }
    return undefined;
  }

  private apply(entry: RegisteredLayer) {
    const map = this.map;
    if (!map) return;
    const source = map.getSource<GeoJSONSource>(entry.id);
    if (source) {
      void source.setData(entry.data);
    } else {
      map.addSource(entry.id, {
        type: 'geojson',
        data: entry.data,
        ...(entry.promoteId ? { promoteId: entry.promoteId } : {}),
      });
    }
    const beforeId = this.beforeIdFor(entry);
    for (const layer of entry.layers) {
      if (!map.getLayer(layer.id)) {
        map.addLayer(layer, beforeId);
      } else if (layerChanged(map, layer)) {
        // הגדרת style השתנתה (למשל צבע) – הכי פשוט וצפוי: להחליף את השכבה
        map.removeLayer(layer.id);
        map.addLayer(layer, beforeId);
      }
      map.setLayoutProperty(layer.id, 'visibility', entry.visible ? 'visible' : 'none');
    }
  }
}

export const layerRegistry = new LayerRegistry();
