'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { searchTools, type Tool } from '@/tools/registry';

/**
 * Shared search state + keyboard behaviour for the tool palette, used by both
 * the inline catalog search and the header search dialog so the two never drift
 * apart. Owns the query, the current result set, and the highlighted row;
 * consumers own how the query is entered and how a chosen tool is opened.
 */
export interface UseToolSearch {
  query: string;
  setQuery: (query: string) => void;
  results: Tool[];
  /** True once the query is non-empty (the catalog swaps browse → results). */
  searching: boolean;
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

export function useToolSearch({
  onSelect,
  onEscape,
  alwaysActive = false,
}: {
  /** Called when a live result is chosen via Enter. */
  onSelect: (tool: Tool) => void;
  /**
   * Called on Escape. Defaults to clearing the query (the inline catalog's
   * behaviour); the dialog passes its own handler to close instead.
   */
  onEscape?: () => void;
  /**
   * Keep arrow/Enter navigation live even with an empty query. The dialog always
   * shows a list (empty query → all tools) so it opts in; the inline catalog
   * shows the browse grid when empty, so it leaves this off.
   */
  alwaysActive?: boolean;
}): UseToolSearch {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const results = useMemo(() => searchTools(query), [query]);
  const searching = query.trim() !== '';
  const active = alwaysActive || searching;

  // Keep the selection in range as results change.
  useEffect(() => setSelected(0), [query]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onEscape) onEscape();
        else setQuery('');
        return;
      }
      if (!active || results.length === 0) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelected((i) => (i + 1) % results.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelected((i) => (i - 1 + results.length) % results.length);
      } else if (event.key === 'Enter') {
        const tool = results[selected];
        if (tool && tool.status === 'live') {
          event.preventDefault();
          onSelect(tool);
        }
      }
    },
    [active, results, selected, onSelect, onEscape],
  );

  return { query, setQuery, results, searching, selected, setSelected, onKeyDown };
}
