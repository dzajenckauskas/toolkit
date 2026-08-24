import { describe, expect, it } from 'vitest';
import { batchCounts, removeItem, updateItem, type BatchItem } from './batch';

function item(overrides: Partial<BatchItem>): BatchItem {
  return { id: 'x', fileName: 'a.jpg', fileSize: 1000, status: 'processing', ...overrides };
}

describe('updateItem', () => {
  it('patches only the matching item without mutating the input', () => {
    const items = [item({ id: 'a' }), item({ id: 'b' })];
    const next = updateItem(items, 'b', { status: 'done', outputSize: 400 });
    expect(next[1]).toMatchObject({ id: 'b', status: 'done', outputSize: 400 });
    expect(next[0]).toBe(items[0]); // untouched reference
    expect(items[1]?.status).toBe('processing'); // original not mutated
  });
});

describe('removeItem', () => {
  it('removes by id', () => {
    const items = [item({ id: 'a' }), item({ id: 'b' })];
    expect(removeItem(items, 'a').map((i) => i.id)).toEqual(['b']);
  });
});

describe('batchCounts', () => {
  it('reports an empty queue as settled with zero totals', () => {
    expect(batchCounts([])).toEqual({
      total: 0,
      done: 0,
      errored: 0,
      processing: 0,
      settled: true,
    });
  });

  it('is not settled while any item is processing', () => {
    const counts = batchCounts([item({ id: 'a', status: 'processing' })]);
    expect(counts.settled).toBe(false);
    expect(counts.processing).toBe(1);
  });

  it('counts done and errored items separately', () => {
    const items = [
      item({ id: 'a', status: 'done' }),
      item({ id: 'b', status: 'done' }),
      item({ id: 'c', status: 'error', error: 'bad' }),
    ];
    expect(batchCounts(items)).toEqual({
      total: 3,
      done: 2,
      errored: 1,
      processing: 0,
      settled: true,
    });
  });
});
