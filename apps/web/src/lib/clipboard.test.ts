import { describe, expect, it } from 'vitest';
import { clipboardImageFiles, type ClipboardItemLike } from './clipboard';

function jpeg(name = 'pasted.jpg'): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type: 'image/jpeg' });
}

function fileItem(file: File | null): ClipboardItemLike {
  return { kind: 'file', getAsFile: () => file };
}

describe('clipboardImageFiles', () => {
  it('returns [] for null/undefined', () => {
    expect(clipboardImageFiles(null)).toEqual([]);
    expect(clipboardImageFiles(undefined)).toEqual([]);
  });

  it('extracts image files from items', () => {
    const file = jpeg();
    expect(clipboardImageFiles({ items: [fileItem(file)] })).toEqual([file]);
  });

  it('ignores non-file items (e.g. pasted text)', () => {
    const textItem: ClipboardItemLike = { kind: 'string', getAsFile: () => null };
    expect(clipboardImageFiles({ items: [textItem] })).toEqual([]);
  });

  it('ignores non-image files', () => {
    const pdf = new File([new Uint8Array([1])], 'doc.pdf', { type: 'application/pdf' });
    expect(clipboardImageFiles({ items: [fileItem(pdf)] })).toEqual([]);
  });

  it('falls back to files when items yields nothing', () => {
    const file = jpeg();
    expect(clipboardImageFiles({ items: [], files: [file] })).toEqual([file]);
  });

  it('prefers items over the files fallback', () => {
    const fromItems = jpeg('a.jpg');
    const fromFiles = jpeg('b.jpg');
    expect(clipboardImageFiles({ items: [fileItem(fromItems)], files: [fromFiles] })).toEqual([
      fromItems,
    ]);
  });
});
