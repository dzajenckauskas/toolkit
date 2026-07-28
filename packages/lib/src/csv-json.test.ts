import { describe, expect, it } from 'vitest';
import { csvToJson, jsonToCsv, parseCsv } from './csv-json';

describe('csv-json', () => {
  it('parses simple CSV', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('handles quoted fields with commas, quotes and newlines', () => {
    const csv = 'name,note\n"Smith, John","said ""hi""\nagain"';
    expect(parseCsv(csv)).toEqual([
      ['name', 'note'],
      ['Smith, John', 'said "hi"\nagain'],
    ]);
  });

  it('converts CSV to JSON using the header row', () => {
    expect(csvToJson('id,name\n1,Alice\n2,Bob')).toEqual([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]);
  });

  it('converts JSON to CSV, quoting where needed', () => {
    const csv = jsonToCsv([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Smith, John' },
    ]);
    expect(csv).toBe('id,name\n1,Alice\n2,"Smith, John"');
  });

  it('round-trips', () => {
    const rows = [
      { a: '1', b: 'x' },
      { a: '2', b: 'y' },
    ];
    expect(csvToJson(jsonToCsv(rows))).toEqual(rows);
  });

  it('handles empty input', () => {
    expect(csvToJson('')).toEqual([]);
    expect(jsonToCsv([])).toBe('');
  });
});
