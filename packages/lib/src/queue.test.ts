import { describe, expect, it } from 'vitest';
import { batchSummary, removeItem, updateItem, type QueueItem } from './queue';

function item(overrides: Partial<QueueItem>): QueueItem {
  return { id: 'x', fileName: 'a.jpg', fileSize: 1000, status: 'optimizing', ...overrides };
}

describe('updateItem', () => {
  it('patches only the matching item without mutating the input', () => {
    const items = [item({ id: 'a' }), item({ id: 'b' })];
    const next = updateItem(items, 'b', { status: 'done', optimizedSize: 400 });
    expect(next[1]).toMatchObject({ id: 'b', status: 'done', optimizedSize: 400 });
    expect(next[0]).toBe(items[0]); // untouched reference
    expect(items[1]?.status).toBe('optimizing'); // original not mutated
  });
});

describe('removeItem', () => {
  it('removes by id', () => {
    const items = [item({ id: 'a' }), item({ id: 'b' })];
    expect(removeItem(items, 'a').map((i) => i.id)).toEqual(['b']);
  });
});

describe('batchSummary', () => {
  it('reports an empty queue as settled with zero totals', () => {
    const s = batchSummary([]);
    expect(s).toMatchObject({ total: 0, done: 0, settled: true, totalSavedPercent: 0 });
  });

  it('is not settled while any item is optimizing', () => {
    const s = batchSummary([item({ id: 'a', status: 'optimizing' })]);
    expect(s.settled).toBe(false);
    expect(s.optimizing).toBe(1);
  });

  it('sums sizes across done items and computes total savings', () => {
    const items = [
      item({ id: 'a', status: 'done', fileSize: 1000, optimizedSize: 400 }),
      item({ id: 'b', status: 'done', fileSize: 3000, optimizedSize: 1600 }),
      item({ id: 'c', status: 'error', error: 'bad' }),
    ];
    const s = batchSummary(items);
    expect(s).toMatchObject({
      total: 3,
      done: 2,
      errored: 1,
      settled: true,
      totalOriginalBytes: 4000,
      totalOptimizedBytes: 2000,
      totalSavedPercent: 50,
    });
  });

  it('counts errors and excludes them from size totals', () => {
    const items = [
      item({ id: 'a', status: 'done', fileSize: 1000, optimizedSize: 900 }),
      item({ id: 'b', status: 'error', fileSize: 5000, error: 'corrupt' }),
    ];
    const s = batchSummary(items);
    expect(s.totalOriginalBytes).toBe(1000);
    expect(s.errored).toBe(1);
  });
});
