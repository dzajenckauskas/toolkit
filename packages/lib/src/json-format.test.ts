import { describe, expect, it } from 'vitest';
import { formatJson, isValidJson, minifyJson } from './json-format';

describe('json-format', () => {
  it('formats valid JSON with indentation', () => {
    const result = formatJson('{"a":1,"b":[2,3]}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
  });

  it('minifies valid JSON', () => {
    const result = minifyJson('{\n  "a": 1\n}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe('{"a":1}');
  });

  it('reports an error for invalid JSON', () => {
    const result = formatJson('{ not json }');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeTruthy();
  });

  it('validates JSON', () => {
    expect(isValidJson('[]')).toBe(true);
    expect(isValidJson('{"x": true}')).toBe(true);
    expect(isValidJson("{'x': 1}")).toBe(false);
    expect(isValidJson('')).toBe(false);
  });

  it('supports tab indentation', () => {
    const result = formatJson('{"a":1}', '\t');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toBe('{\n\t"a": 1\n}');
  });
});
