import { describe, expect, it } from 'vitest';
import { validateFile, type FileLike } from './validation';
import { MAX_FILE_BYTES } from './constants';

function file(overrides: Partial<FileLike>): FileLike {
  return { name: 'photo.jpg', type: 'image/jpeg', size: 1000, ...overrides };
}

describe('validateFile', () => {
  it('accepts a normal JPEG by MIME type', () => {
    expect(validateFile(file({})).ok).toBe(true);
  });

  it('accepts a JPEG by extension when the browser omits the MIME type', () => {
    const result = validateFile(file({ type: '', name: 'holiday.JPG' }));
    expect(result.ok).toBe(true);
  });

  it('rejects an empty file with the "empty" code', () => {
    const result = validateFile(file({ size: 0 }));
    expect(result.ok).toBe(false);
    expect(result.code).toBe('empty');
    expect(result.message).toMatch(/empty/i);
  });

  it('rejects unsupported types with a helpful message', () => {
    const result = validateFile(file({ type: 'image/png', name: 'logo.png' }));
    expect(result.ok).toBe(false);
    expect(result.code).toBe('unsupported-type');
    expect(result.message).toMatch(/JPEG/);
  });

  it('does not accept a non-JPEG extension when the MIME type is empty', () => {
    const result = validateFile(file({ type: '', name: 'logo.png' }));
    expect(result.ok).toBe(false);
    expect(result.code).toBe('unsupported-type');
  });

  it('rejects files above the size limit', () => {
    const result = validateFile(file({ size: MAX_FILE_BYTES + 1 }));
    expect(result.ok).toBe(false);
    expect(result.code).toBe('too-large');
  });

  it('accepts a file exactly at the size limit', () => {
    expect(validateFile(file({ size: MAX_FILE_BYTES })).ok).toBe(true);
  });
});
