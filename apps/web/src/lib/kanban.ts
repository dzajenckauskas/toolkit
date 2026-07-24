/**
 * Kanban board state — pure, immutable operations over a simple columns model.
 * Persistence (localStorage) and rendering live in the component. Pure.
 */

export interface Card {
  id: string;
  text: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export type Board = Column[];

export function newId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function defaultBoard(): Board {
  return [
    { id: 'todo', title: 'To do', cards: [] },
    { id: 'doing', title: 'In progress', cards: [] },
    { id: 'done', title: 'Done', cards: [] },
  ];
}

export function addCard(board: Board, columnId: string, text: string): Board {
  const trimmed = text.trim();
  if (trimmed === '') return board;
  return board.map((col) =>
    col.id === columnId ? { ...col, cards: [...col.cards, { id: newId(), text: trimmed }] } : col,
  );
}

export function removeCard(board: Board, cardId: string): Board {
  return board.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== cardId) }));
}

export function editCard(board: Board, cardId: string, text: string): Board {
  return board.map((col) => ({
    ...col,
    cards: col.cards.map((c) => (c.id === cardId ? { ...c, text } : c)),
  }));
}

/** Move a card to another column (appended at the end). No-op if not found. */
export function moveCard(board: Board, cardId: string, toColumnId: string): Board {
  let moved: Card | undefined;
  const without = board.map((col) => {
    const found = col.cards.find((c) => c.id === cardId);
    if (found) moved = found;
    return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
  });
  if (!moved) return board;
  return without.map((col) =>
    col.id === toColumnId ? { ...col, cards: [...col.cards, moved!] } : col,
  );
}

/** Index of a column, or -1. Used to compute the "move left/right" targets. */
export function columnIndex(board: Board, columnId: string): number {
  return board.findIndex((c) => c.id === columnId);
}
