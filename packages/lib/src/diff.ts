/**
 * Line-based diff via a classic longest-common-subsequence table. Pure — no
 * dependencies. Good enough for the text-diff tool's side-by-side view.
 */

export type DiffType = 'same' | 'add' | 'del';

export interface DiffLine {
  type: DiffType;
  text: string;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export interface SideBySideDiffRow {
  before: DiffLine | null;
  after: DiffLine | null;
}

function splitLines(value: string): string[] {
  if (value === '') return [];
  return value.replace(/\r\n/g, '\n').split('\n');
}

/** Compute a line diff of `before` → `after`. */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = splitLines(before);
  const b = splitLines(after);
  const n = a.length;
  const m = b.length;

  // lcs[i][j] = length of LCS of a[i:] and b[j:]
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i]![j] =
        a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: 'same', text: a[i]! });
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      out.push({ type: 'del', text: a[i]! });
      i++;
    } else {
      out.push({ type: 'add', text: b[j]! });
      j++;
    }
  }
  while (i < n) out.push({ type: 'del', text: a[i++]! });
  while (j < m) out.push({ type: 'add', text: b[j++]! });
  return out;
}

export function diffStats(lines: DiffLine[]): DiffStats {
  return lines.reduce<DiffStats>(
    (acc, line) => {
      if (line.type === 'add') acc.added++;
      else if (line.type === 'del') acc.removed++;
      else acc.unchanged++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 },
  );
}

/**
 * Align a linear diff into review-style rows. Consecutive deleted and added
 * lines are paired by position; unmatched lines leave an empty cell.
 */
export function alignDiffLines(lines: DiffLine[]): SideBySideDiffRow[] {
  const rows: SideBySideDiffRow[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index]!;
    if (line.type === 'same') {
      rows.push({ before: line, after: line });
      index++;
      continue;
    }

    const removed: DiffLine[] = [];
    const added: DiffLine[] = [];
    while (index < lines.length && lines[index]!.type !== 'same') {
      const changed = lines[index++]!;
      if (changed.type === 'del') removed.push(changed);
      else added.push(changed);
    }

    const count = Math.max(removed.length, added.length);
    for (let row = 0; row < count; row++) {
      rows.push({ before: removed[row] ?? null, after: added[row] ?? null });
    }
  }

  return rows;
}
