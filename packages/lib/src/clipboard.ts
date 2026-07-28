/**
 * Extract pasted image files from a clipboard payload.
 *
 * Kept structurally typed (rather than depending on the exact DataTransfer DOM
 * shape) so it is trivially unit-testable without a real clipboard. The
 * component passes the paste event's `clipboardData`. Only image files are
 * returned; format validation (JPEG-only, for now) happens downstream in
 * `validateFile`, so a pasted PNG still surfaces the normal "JPEG only" error.
 */

export interface ClipboardItemLike {
  kind: string;
  getAsFile: () => File | null;
}

export interface ClipboardLike {
  items?: ArrayLike<ClipboardItemLike> | null;
  files?: ArrayLike<File> | null;
}

export function clipboardImageFiles(data: ClipboardLike | null | undefined): File[] {
  if (!data) return [];

  const images: File[] = [];

  // Preferred path: DataTransferItemList, filtered to file items.
  if (data.items) {
    for (let i = 0; i < data.items.length; i += 1) {
      const item = data.items[i];
      if (item && item.kind === 'file') {
        const file = item.getAsFile();
        if (file && file.type.startsWith('image/')) {
          images.push(file);
        }
      }
    }
  }

  // Fallback: some browsers expose pasted files only via `files`.
  if (images.length === 0 && data.files) {
    for (let i = 0; i < data.files.length; i += 1) {
      const file = data.files[i];
      if (file && file.type.startsWith('image/')) {
        images.push(file);
      }
    }
  }

  return images;
}
