/** הגדרות ה-mock (נשלטות מתפריט "כלי פיתוח" בכותרת) */
type Listener = () => void;

interface MockSettings {
  /** כאשר true – כ-25% מהבקשות נכשלות ב-500 */
  simulateErrors: boolean;
  minLatencyMs: number;
  maxLatencyMs: number;
}

let settings: MockSettings = { simulateErrors: false, minLatencyMs: 300, maxLatencyMs: 600 };
const listeners = new Set<Listener>();

export const mockSettings = {
  get: (): MockSettings => settings,
  set(patch: Partial<MockSettings>) {
    settings = { ...settings, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
