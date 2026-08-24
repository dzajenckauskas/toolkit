import { updateItem, removeItem } from './queue';

/**
 * Generic multi-file batch queue for the image tools that apply one
 * operation to every loaded file (Resize, Convert, Rotate) — as opposed to
 * the Optimizer's queue (`queue.ts`), which additionally tracks byte
 * savings. Kept separate so each stays a simple, honest model for its own
 * tool rather than one shape trying to fit both.
 */

export type BatchStatus = 'processing' | 'done' | 'error';

export interface BatchItem {
  /** Stable id for React keys and lookups. */
  id: string;
  fileName: string;
  fileSize: number;
  status: BatchStatus;
  // Present once decoding/processing succeeds.
  width?: number;
  height?: number;
  previewUrl?: string;
  outputUrl?: string;
  outputSize?: number;
  downloadName?: string;
  // Present when status is 'error'.
  error?: string;
}

export interface BatchCounts {
  total: number;
  done: number;
  errored: number;
  processing: number;
  /** Whether no item is still processing. */
  settled: boolean;
}

/** Aggregate status counts across the batch. */
export function batchCounts(items: BatchItem[]): BatchCounts {
  let done = 0;
  let errored = 0;
  let processing = 0;

  for (const item of items) {
    if (item.status === 'processing') processing += 1;
    else if (item.status === 'error') errored += 1;
    else if (item.status === 'done') done += 1;
  }

  return { total: items.length, done, errored, processing, settled: processing === 0 };
}

export { updateItem, removeItem };
