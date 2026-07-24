'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@/components/ui';
import { addCard, columnIndex, defaultBoard, moveCard, removeCard, type Board } from '@/lib/kanban';

const STORAGE_KEY = 'toolkit:kanban';

const Columns = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: theme.space(3),
  alignItems: 'start',
}));

const ColumnBox = styled('section')(({ theme }) => ({
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
  padding: theme.space(3),
}));

const ColTitle = styled('h2')(({ theme }) => ({
  margin: `0 0 ${theme.space(2)}`,
  fontSize: '0.85rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: theme.color.muted,
}));

const CardBox = styled('div')(({ theme }) => ({
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.sm,
  background: theme.color.bg,
  padding: theme.space(2),
  marginBottom: theme.space(2),
}));

const CardText = styled('div')(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.color.text,
  marginBottom: theme.space(2),
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));

const CardActions = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(1),
  justifyContent: 'space-between',
}));

const AddRow = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(1),
  marginTop: theme.space(2),
}));

const Input = styled('input')(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  padding: '0.4rem 0.6rem',
  fontSize: '0.9rem',
  color: theme.color.text,
  background: theme.color.bg,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: '8px',
}));

export default function KanbanBoard() {
  const [board, setBoard] = useState<Board>(defaultBoard);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  // Load once on mount (client-only → no hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBoard(JSON.parse(raw) as Board);
    } catch {
      /* ignore corrupt/unavailable storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    } catch {
      /* storage may be unavailable */
    }
  }, [board, loaded]);

  const submit = useCallback(
    (columnId: string) => {
      setBoard((b) => addCard(b, columnId, drafts[columnId] ?? ''));
      setDrafts((d) => ({ ...d, [columnId]: '' }));
    },
    [drafts],
  );

  const move = (cardId: string, dir: -1 | 1) => {
    setBoard((b) => {
      const from = b.find((col) => col.cards.some((c) => c.id === cardId));
      if (!from) return b;
      const target = b[columnIndex(b, from.id) + dir];
      return target ? moveCard(b, cardId, target.id) : b;
    });
  };

  return (
    <Stack gap={3}>
      <Columns>
        {board.map((col, colIdx) => (
          <ColumnBox key={col.id} data-testid={`kanban-col-${col.id}`}>
            <ColTitle>
              {col.title} ({col.cards.length})
            </ColTitle>
            {col.cards.map((card) => (
              <CardBox key={card.id} data-testid={`kanban-card`}>
                <CardText>{card.text}</CardText>
                <CardActions>
                  <span style={{ display: 'flex', gap: 4 }}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => move(card.id, -1)}
                      disabled={colIdx === 0}
                      aria-label="Move left"
                      data-testid="kanban-move-left"
                    >
                      ←
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => move(card.id, 1)}
                      disabled={colIdx === board.length - 1}
                      aria-label="Move right"
                      data-testid="kanban-move-right"
                    >
                      →
                    </Button>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setBoard((b) => removeCard(b, card.id))}
                    aria-label="Delete card"
                    data-testid="kanban-delete"
                  >
                    ×
                  </Button>
                </CardActions>
              </CardBox>
            ))}
            <AddRow>
              <Input
                value={drafts[col.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [col.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit(col.id);
                }}
                placeholder="Add a card…"
                aria-label={`Add a card to ${col.title}`}
                data-testid={`kanban-input-${col.id}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => submit(col.id)}
                data-testid={`kanban-add-${col.id}`}
              >
                Add
              </Button>
            </AddRow>
          </ColumnBox>
        ))}
      </Columns>
      <Text tone="muted" size="sm">
        Your board is saved in this browser only (localStorage) — nothing is uploaded.
      </Text>
    </Stack>
  );
}
