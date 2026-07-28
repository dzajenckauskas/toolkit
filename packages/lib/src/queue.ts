import { calculateSavings } from './savings';

/**
 * Queue model for optimizing multiple images in one session.
 *
 * The React component owns the source File objects and object URLs (side
 * effects); this module holds the pure, unit-testable shape and math.
 */

export type ItemStatus = 'optimizing' | 'done' | 'error';

export interface QueueItem {
  /** Stable id for React keys and lookups. */
  id: string;
  fileName: string;
  fileSize: number;
  status: ItemStatus;
  // Present once decoding/encoding succeeds.
  width?: number;
  height?: number;
  previewUrl?: string;
  optimizedUrl?: string;
  optimizedSize?: number;
  downloadName?: string;
  // Present when status is 'error'.
  error?: string;
}

export interface BatchSummary {
  total: number;
  done: number;
  errored: number;
  optimizing: number;
  /** Whether no item is still processing. */
  settled: boolean;
  /** Summed sizes across *done* items only. */
  totalOriginalBytes: number;
  totalOptimizedBytes: number;
  /** Total saved across done items, one decimal; negative if the batch grew. */
  totalSavedPercent: number;
}

/** Replace the item with `id`, returning a new array (no mutation). */
export function updateItem(items: QueueItem[], id: string, patch: Partial<QueueItem>): QueueItem[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

/** Remove the item with `id`, returning a new array. */
export function removeItem(items: QueueItem[], id: string): QueueItem[] {
  return items.filter((item) => item.id !== id);
}

/** Aggregate counts and total savings across the queue. */
export function batchSummary(items: QueueItem[]): BatchSummary {
  let done = 0;
  let errored = 0;
  let optimizing = 0;
  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;

  for (const item of items) {
    if (item.status === 'optimizing') optimizing += 1;
    else if (item.status === 'error') errored += 1;
    else if (item.status === 'done') {
      done += 1;
      totalOriginalBytes += item.fileSize;
      totalOptimizedBytes += item.optimizedSize ?? item.fileSize;
    }
  }

  const totalSavedPercent = calculateSavings(totalOriginalBytes, totalOptimizedBytes).savedPercent;

  return {
    total: items.length,
    done,
    errored,
    optimizing,
    settled: optimizing === 0,
    totalOriginalBytes,
    totalOptimizedBytes,
    totalSavedPercent,
  };
}
