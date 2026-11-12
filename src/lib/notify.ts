/** תור הודעות Snackbar גלובלי – נגיש גם מחוץ ל-React (למשל מ-QueryClient) */
export type Severity = 'success' | 'info' | 'warning' | 'error';
export interface Notification {
  id: number;
  message: string;
  severity: Severity;
}

type Listener = () => void;
let queue: Notification[] = [];
let seq = 0;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

export const notifications = {
  push(message: string, severity: Severity = 'info') {
    seq += 1;
    queue = [...queue, { id: seq, message, severity }];
    emit();
  },
  shift() {
    queue = queue.slice(1);
    emit();
  },
  getSnapshot: (): Notification[] => queue,
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export const notify = {
  success: (m: string) => notifications.push(m, 'success'),
  info: (m: string) => notifications.push(m, 'info'),
  warning: (m: string) => notifications.push(m, 'warning'),
  error: (m: string) => notifications.push(m, 'error'),
};
