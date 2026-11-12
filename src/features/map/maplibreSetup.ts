/**
 * הגדרת MapLibre GL v6 (ESM בלבד).
 * ב-v6 ה-worker הוא קובץ ESM נפרד שנטען יחסית ל-import.meta.url של הספרייה.
 * אחרי bundling ב-Vite הנתיב היחסי כבר לא קיים, ולכן מייבאים את ה-worker כ-asset (?url)
 * ומגדירים אותו במפורש עם setWorkerUrl – לפי ההנחיות של v6.
 */
import { getRTLTextPluginStatus, setRTLTextPlugin, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(workerUrl);

/** תוסף RTL לעיצוב נכון של תוויות בעברית על המפה (נטען בעצלתיים, לא חוסם) */
if (getRTLTextPluginStatus() === 'unavailable') {
  setRTLTextPlugin(
    'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
    true,
  ).catch(() => {
    /* לא קריטי – בלי חיבור לאינטרנט התוויות פשוט לא יעוצבו */
  });
}

/** מפת בסיס ללא מפתח API */
export const BASE_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
