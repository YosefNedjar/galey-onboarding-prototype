/** נתוני seed דטרמיניסטיים: 3 פרויקטים ו-150 אתרים ברחבי ישראל */
import type { Project, Region, Site, SiteType } from '../types/domain';
import { SITE_TYPE_LABEL } from '../lib/labels';

/** PRNG פשוט (mulberry32) כדי שה-seed יהיה זהה בכל טעינה */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Anchor {
  city: string;
  lat: number;
  lng: number;
}

const ANCHORS: Record<Region, Anchor[]> = {
  north: [
    { city: 'חיפה', lat: 32.794, lng: 35.02 },
    { city: 'נהריה', lat: 33.006, lng: 35.11 },
    { city: 'כרמיאל', lat: 32.914, lng: 35.296 },
    { city: 'צפת', lat: 32.964, lng: 35.496 },
    { city: 'טבריה', lat: 32.79, lng: 35.52 },
    { city: 'קריית שמונה', lat: 33.207, lng: 35.57 },
    { city: 'עפולה', lat: 32.607, lng: 35.289 },
    { city: 'נצרת', lat: 32.703, lng: 35.297 },
  ],
  center: [
    { city: 'תל אביב', lat: 32.08, lng: 34.795 },
    { city: 'פתח תקווה', lat: 32.087, lng: 34.887 },
    { city: 'ראשון לציון', lat: 31.964, lng: 34.804 },
    { city: 'נתניה', lat: 32.321, lng: 34.873 },
    { city: 'הרצליה', lat: 32.166, lng: 34.844 },
    { city: 'רחובות', lat: 31.894, lng: 34.811 },
    { city: 'מודיעין', lat: 31.898, lng: 35.01 },
    { city: 'ירושלים', lat: 31.778, lng: 35.215 },
  ],
  south: [
    { city: 'באר שבע', lat: 31.252, lng: 34.791 },
    { city: 'אשדוד', lat: 31.8, lng: 34.66 },
    { city: 'אשקלון', lat: 31.668, lng: 34.59 },
    { city: 'קריית גת', lat: 31.61, lng: 34.77 },
    { city: 'קריית מלאכי', lat: 31.73, lng: 34.745 },
    { city: 'דימונה', lat: 31.069, lng: 35.033 },
    { city: 'ערד', lat: 31.259, lng: 35.213 },
    { city: 'מצפה רמון', lat: 30.61, lng: 34.8 },
    { city: 'אילת', lat: 29.56, lng: 34.95 },
  ],
};

const TYPES: SiteType[] = ['antenna', 'antenna', 'relay', 'station'];

export function seedData(): { projects: Project[]; sites: Site[] } {
  const rng = createRng(20260101);
  const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)] as T;
  const between = (min: number, max: number) => min + rng() * (max - min);

  const projectDefs: {
    id: string;
    name: string;
    description: string;
    region: Region;
    owner: string;
  }[] = [
    {
      id: 'p-north',
      name: 'פריסת צפון – גליל וגולן',
      description: 'תכנון פריסת אתרים לכיסוי ציר הצפון והגליל העליון.',
      region: 'north',
      owner: 'צוות גלי ישראל',
    },
    {
      id: 'p-center',
      name: 'מרכז – גוש דן וירושלים',
      description: 'עיבוי רשת באזורים עירוניים צפופים.',
      region: 'center',
      owner: 'צוות גלי ישראל',
    },
    {
      id: 'p-south',
      name: 'דרום – נגב וערבה',
      description: 'כיסוי מרחבים פתוחים, ממסרים לטווח ארוך.',
      region: 'south',
      owner: 'צוות גלי ישראל',
    },
  ];

  const sites: Site[] = [];
  let counter = 1;
  for (const def of projectDefs) {
    const perCity = new Map<string, number>();
    for (let i = 0; i < 50; i++) {
      const anchor = pick(ANCHORS[def.region]);
      const type = pick(TYPES);
      const n = (perCity.get(anchor.city + type) ?? 0) + 1;
      perCity.set(anchor.city + type, n);
      sites.push({
        id: `s-${String(counter++).padStart(4, '0')}`,
        projectId: def.id,
        name: `${SITE_TYPE_LABEL[type]} ${anchor.city} ${String(n).padStart(2, '0')}`,
        type,
        lat: Math.round((anchor.lat + between(-0.06, 0.06)) * 1e5) / 1e5,
        lng: Math.round((anchor.lng + between(-0.05, 0.05)) * 1e5) / 1e5,
        heightM: Math.round(type === 'relay' ? between(30, 90) : between(10, 50)),
        powerW: Math.round(type === 'station' ? between(200, 800) : between(10, 300)),
        frequencyMHz: Math.round(pick([450, 900, 1800, 2100, 2600, 3500]) + between(-20, 20)),
        status: rng() < 0.75 ? 'active' : 'planned',
        updatedAt: new Date(Date.UTC(2026, 9, 1) + Math.floor(rng() * 30) * 86400000).toISOString(),
      });
    }
  }

  const projects: Project[] = projectDefs.map((d, i) => ({
    ...d,
    createdAt: new Date(Date.UTC(2026, 8, 1 + i * 7)).toISOString(),
    siteCount: 0,
  }));

  return { projects, sites };
}
