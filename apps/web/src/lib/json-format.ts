/**
 * JSON validate / format / minify. Pure wrappers around JSON.parse with
 * friendly error reporting for the JSON tool.
 */

export type JsonResult =
  { ok: true; output: string } | { ok: false; error: string; position?: number };

function parse(input: string): { value: unknown } | { error: string; position?: number } {
  try {
    return { value: JSON.parse(input) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    const match = /position (\d+)/.exec(message);
    return match ? { error: message, position: Number(match[1]) } : { error: message };
  }
}

/** Pretty-print with the given indent (2 or 4 spaces, or a tab). */
export function formatJson(input: string, indent: number | '\t' = 2): JsonResult {
  const parsed = parse(input);
  if ('error' in parsed) return { ok: false, error: parsed.error, position: parsed.position };
  return { ok: true, output: JSON.stringify(parsed.value, null, indent) };
}

/** Collapse to a single line. */
export function minifyJson(input: string): JsonResult {
  const parsed = parse(input);
  if ('error' in parsed) return { ok: false, error: parsed.error, position: parsed.position };
  return { ok: true, output: JSON.stringify(parsed.value) };
}

/** True when the input is syntactically valid JSON. */
export function isValidJson(input: string): boolean {
  return !('error' in parse(input));
}
