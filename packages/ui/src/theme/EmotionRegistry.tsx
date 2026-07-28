'use client';

import { useState, type ReactNode } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider, ThemeProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import { theme } from './theme';
import { GlobalStyles } from './GlobalStyles';

/**
 * Emotion SSR for the Next.js App Router.
 *
 * Emotion inserts styles as it renders; this registry collects the names
 * inserted during a server render and flushes them into <style> tags via
 * useServerInsertedHTML, so the first paint is styled (no FOUC) and hydration
 * matches. Standard pattern from the Emotion docs, adapted with strict types.
 */
export default function EmotionRegistry({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'ec' });
    cache.compat = true;

    const prevInsert = cache.insert.bind(cache);
    let inserted: string[] = [];

    cache.insert = (...args: Parameters<typeof prevInsert>) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flush = (): string[] => {
      const prev = inserted;
      inserted = [];
      return prev;
    };

    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    let styles = '';
    for (const name of names) {
      const rules = cache.inserted[name];
      if (typeof rules === 'string') {
        styles += rules;
      }
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        // Styles are produced by Emotion from our own code, not user input.
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
