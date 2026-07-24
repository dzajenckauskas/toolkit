'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@/components/ui';
import { percentChange, percentOf, tip, whatPercent } from '@/lib/percentage';

const Field = styled('label')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space(1),
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.color.muted,
}));

const Input = styled('input')(({ theme }) => ({
  width: '6rem',
  padding: '0.4rem 0.6rem',
  fontSize: '1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: '8px',
}));

const Panel = styled('div')(({ theme }) => ({
  padding: theme.space(4),
  border: `1px solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  background: theme.color.surface,
}));

const Row = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.space(2),
  alignItems: 'flex-end',
  flexWrap: 'wrap',
}));

const fmt = (n: number) => (Number.isFinite(n) ? String(Math.round(n * 100) / 100) : '—');

export default function PercentageCalculator() {
  const [a, setA] = useState(15);
  const [b, setB] = useState(200);
  const [part, setPart] = useState(30);
  const [whole, setWhole] = useState(200);
  const [from, setFrom] = useState(100);
  const [to, setTo] = useState(150);
  const [bill, setBill] = useState(50);
  const [tipPct, setTipPct] = useState(18);
  const [people, setPeople] = useState(2);

  const tipResult = tip(bill, tipPct, people);

  return (
    <Stack gap={4}>
      <Panel>
        <Row>
          <Field>
            Percent
            <Input
              type="number"
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              data-testid="pct-a"
            />
          </Field>
          <Text as="span" tone="muted">
            % of
          </Text>
          <Field>
            Total
            <Input
              type="number"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              data-testid="pct-b"
            />
          </Field>
          <Text weight={700} data-testid="pct-of-result">
            = {fmt(percentOf(a, b))}
          </Text>
        </Row>
      </Panel>

      <Panel>
        <Row>
          <Field>
            Value
            <Input
              type="number"
              value={part}
              onChange={(e) => setPart(Number(e.target.value))}
              data-testid="pct-part"
            />
          </Field>
          <Text as="span" tone="muted">
            is what % of
          </Text>
          <Field>
            Total
            <Input
              type="number"
              value={whole}
              onChange={(e) => setWhole(Number(e.target.value))}
              data-testid="pct-whole"
            />
          </Field>
          <Text weight={700} data-testid="pct-what-result">
            = {fmt(whatPercent(part, whole))}%
          </Text>
        </Row>
      </Panel>

      <Panel>
        <Row>
          <Field>
            From
            <Input
              type="number"
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              data-testid="pct-from"
            />
          </Field>
          <Field>
            To
            <Input
              type="number"
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              data-testid="pct-to"
            />
          </Field>
          <Text weight={700} data-testid="pct-change-result">
            change = {fmt(percentChange(from, to))}%
          </Text>
        </Row>
      </Panel>

      <Panel>
        <Row>
          <Field>
            Bill
            <Input
              type="number"
              value={bill}
              onChange={(e) => setBill(Number(e.target.value))}
              data-testid="tip-bill"
            />
          </Field>
          <Field>
            Tip %
            <Input
              type="number"
              value={tipPct}
              onChange={(e) => setTipPct(Number(e.target.value))}
              data-testid="tip-pct"
            />
          </Field>
          <Field>
            People
            <Input
              type="number"
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              data-testid="tip-people"
            />
          </Field>
        </Row>
        <Text weight={700} data-testid="tip-result">
          Tip {fmt(tipResult.tip)} · Total {fmt(tipResult.total)} · {fmt(tipResult.perPerson)} each
        </Text>
      </Panel>
    </Stack>
  );
}
