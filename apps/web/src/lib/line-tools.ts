/**
 * Line-oriented text transforms for the line-tools utility. Pure; each takes
 * and returns a whole block of text.
 */

function lines(text: string): string[] {
  return text.replace(/\r\n/g, '\n').split('\n');
}

export function sortLines(text: string, direction: 'asc' | 'desc' = 'asc'): string {
  const sorted = lines(text).sort((a, b) => a.localeCompare(b));
  if (direction === 'desc') sorted.reverse();
  return sorted.join('\n');
}

export function dedupeLines(text: string): string {
  const seen = new Set<string>();
  return lines(text)
    .filter((line) => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    })
    .join('\n');
}

export function reverseLines(text: string): string {
  return lines(text).reverse().join('\n');
}

export function shuffleLines(text: string): string {
  const arr = lines(text);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr.join('\n');
}

export function trimLines(text: string): string {
  return lines(text)
    .map((line) => line.trim())
    .join('\n');
}

export function removeEmptyLines(text: string): string {
  return lines(text)
    .filter((line) => line.trim() !== '')
    .join('\n');
}

export interface LineStats {
  lines: number;
  nonEmpty: number;
  unique: number;
}

export function lineStats(text: string): LineStats {
  const all = lines(text);
  return {
    lines: all.length,
    nonEmpty: all.filter((l) => l.trim() !== '').length,
    unique: new Set(all).size,
  };
}
