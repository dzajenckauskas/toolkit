/**
 * CSV ↔ JSON conversion with an RFC 4180-ish parser (handles quoted fields,
 * escaped quotes, and commas/newlines inside quotes). Pure; works anywhere.
 */

/** Parse CSV text into rows of string cells. */
export function parseCsv(text: string, delimiter = ','): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const pushField = () => {
    row.push(field);
    field = '';
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  while (i < src.length) {
    const char = src[i]!;
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += char;
        i++;
      }
    } else if (char === '"') {
      inQuotes = true;
      i++;
    } else if (char === delimiter) {
      pushField();
      i++;
    } else if (char === '\n') {
      pushRow();
      i++;
    } else {
      field += char;
      i++;
    }
  }
  // Flush the trailing field/row unless the input ended with a newline.
  if (field !== '' || row.length > 0) pushRow();
  return rows;
}

/** CSV (with a header row) → array of objects. */
export function csvToJson(text: string, delimiter = ','): Record<string, string>[] {
  const rows = parseCsv(text, delimiter).filter((r) => !(r.length === 1 && r[0] === ''));
  if (rows.length === 0) return [];
  const [header, ...body] = rows as [string[], ...string[][]];
  return body.map((cells) => {
    const obj: Record<string, string> = {};
    header.forEach((key, idx) => {
      obj[key] = cells[idx] ?? '';
    });
    return obj;
  });
}

function escapeCell(value: string, delimiter: string): string {
  return /["\n]/.test(value) || value.includes(delimiter)
    ? `"${value.replace(/"/g, '""')}"`
    : value;
}

/** Array of objects → CSV (keys of the first object become the header). */
export function jsonToCsv(rows: Record<string, unknown>[], delimiter = ','): string {
  if (rows.length === 0) return '';
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const lines = [headers.map((h) => escapeCell(h, delimiter)).join(delimiter)];
  for (const row of rows) {
    lines.push(
      headers
        .map((h) => {
          const value = row[h];
          return escapeCell(value == null ? '' : String(value), delimiter);
        })
        .join(delimiter),
    );
  }
  return lines.join('\n');
}
