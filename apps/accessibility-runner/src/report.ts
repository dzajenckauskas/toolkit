import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function ensureResultsDir(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true });
}

export async function writeJson(
  directory: string,
  filename: string,
  value: unknown,
): Promise<void> {
  await writeFile(path.join(directory, filename), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function safeTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}
