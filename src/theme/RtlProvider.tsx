/** RTL מלא: Emotion cache עם stylis-plugin-rtl שהופך margin/padding/left/right בכל הסגנונות */
import type { ReactNode } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

const rtlCache = createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });

export function RtlProvider({ children }: { children: ReactNode }) {
  return <CacheProvider value={rtlCache}>{children}</CacheProvider>;
}
