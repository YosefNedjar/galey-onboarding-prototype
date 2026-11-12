/** מה מוצג כרגע על המפה מתוך תוצאות החישוב */
export interface CoverageView {
  /** ריצה בודדת המוצגת על המפה */
  shownTaskId: string | null;
  /** מצב השוואה – שתי ריצות בצבעים שונים */
  compareA: string | null;
  compareB: string | null;
}

export const EMPTY_COVERAGE_VIEW: CoverageView = {
  shownTaskId: null,
  compareA: null,
  compareB: null,
};

export const COVERAGE_COLORS = {
  single: '#22D3EE',
  a: '#2F5BEA',
  b: '#A21CAF',
} as const;

export const isComparing = (v: CoverageView): boolean =>
  Boolean(v.compareA && v.compareB && v.compareA !== v.compareB);
