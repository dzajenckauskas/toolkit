import { describe, expect, it } from 'vitest';
import { addCard, columnIndex, defaultBoard, editCard, moveCard, removeCard } from './kanban';

describe('kanban', () => {
  it('adds a card to a column, ignoring blank text', () => {
    let board = defaultBoard();
    board = addCard(board, 'todo', 'First task');
    board = addCard(board, 'todo', '   ');
    expect(board[0]!.cards).toHaveLength(1);
    expect(board[0]!.cards[0]!.text).toBe('First task');
  });

  it('moves a card between columns', () => {
    let board = addCard(defaultBoard(), 'todo', 'Task');
    const id = board[0]!.cards[0]!.id;
    board = moveCard(board, id, 'doing');
    expect(board[0]!.cards).toHaveLength(0);
    expect(board[1]!.cards[0]!.id).toBe(id);
  });

  it('removes and edits cards', () => {
    let board = addCard(defaultBoard(), 'todo', 'Task');
    const id = board[0]!.cards[0]!.id;
    board = editCard(board, id, 'Edited');
    expect(board[0]!.cards[0]!.text).toBe('Edited');
    board = removeCard(board, id);
    expect(board[0]!.cards).toHaveLength(0);
  });

  it('is a no-op moving an unknown card', () => {
    const board = addCard(defaultBoard(), 'todo', 'Task');
    expect(moveCard(board, 'nope', 'doing')).toEqual(board);
  });

  it('reports column indices', () => {
    const board = defaultBoard();
    expect(columnIndex(board, 'todo')).toBe(0);
    expect(columnIndex(board, 'done')).toBe(2);
    expect(columnIndex(board, 'nope')).toBe(-1);
  });
});
