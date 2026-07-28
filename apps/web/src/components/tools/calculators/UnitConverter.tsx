'use client';

import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { Stack, Text } from '@toolkit/ui';
import {
  CATEGORIES,
  TEMPERATURE_UNITS,
  type TempUnit,
  convertLinear,
  convertTemperature,
} from '@toolkit/lib/unit-convert';

const Input = styled('input')(({ theme }) => ({
  width: '100%',
  padding: '0.6rem 0.8rem',
  fontSize: '1.1rem',
  color: theme.color.text,
  background: theme.color.surface,
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
}));

const Grid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  gap: theme.space(2),
  alignItems: 'center',
}));

const TEMP_LABEL: Record<TempUnit, string> = { C: 'Celsius', F: 'Fahrenheit', K: 'Kelvin' };
const CATEGORY_IDS = [...CATEGORIES.map((c) => c.id), 'temperature'];
const CATEGORY_LABEL: Record<string, string> = {
  ...Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])),
  temperature: 'Temperature',
};

const round = (n: number) => {
  if (!Number.isFinite(n)) return '';
  return String(Math.round(n * 1e6) / 1e6);
};

export default function UnitConverter() {
  const [categoryId, setCategoryId] = useState('length');
  const [value, setValue] = useState('1');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');

  const isTemp = categoryId === 'temperature';
  const category = CATEGORIES.find((c) => c.id === categoryId);

  const output = useMemo(() => {
    const n = Number(value);
    if (value.trim() === '' || Number.isNaN(n)) return '';
    if (isTemp) return round(convertTemperature(n, from as TempUnit, to as TempUnit));
    if (!category) return '';
    const fromUnit = category.units.find((u) => u.id === from);
    const toUnit = category.units.find((u) => u.id === to);
    if (!fromUnit || !toUnit) return '';
    return round(convertLinear(n, fromUnit.factor, toUnit.factor));
  }, [value, from, to, isTemp, category]);

  const changeCategory = (id: string) => {
    setCategoryId(id);
    if (id === 'temperature') {
      setFrom('C');
      setTo('F');
    } else {
      const cat = CATEGORIES.find((c) => c.id === id)!;
      setFrom(cat.units[0]!.id);
      setTo(cat.units[1]!.id);
    }
  };

  const options = isTemp
    ? TEMPERATURE_UNITS.map((u) => ({ id: u, label: TEMP_LABEL[u] }))
    : (category?.units ?? []).map((u) => ({ id: u.id, label: u.label }));

  return (
    <Stack gap={4}>
      <label>
        <Text as="span" tone="muted" size="sm" weight={600}>
          Category{' '}
        </Text>
        <select
          value={categoryId}
          onChange={(event) => changeCategory(event.target.value)}
          data-testid="unit-category"
        >
          {CATEGORY_IDS.map((id) => (
            <option key={id} value={id}>
              {CATEGORY_LABEL[id]}
            </option>
          ))}
        </select>
      </label>

      <Grid>
        <Stack gap={1}>
          <Input
            type="number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label="Value"
            data-testid="unit-value"
          />
          <select
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            aria-label="From unit"
            data-testid="unit-from"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Stack>

        <Text as="span" tone="muted" aria-hidden>
          →
        </Text>

        <Stack gap={1}>
          <Input readOnly value={output} aria-label="Result" data-testid="unit-output" />
          <select
            value={to}
            onChange={(event) => setTo(event.target.value)}
            aria-label="To unit"
            data-testid="unit-to"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Stack>
      </Grid>

      <Text tone="muted" size="sm">
        Converted in your browser. Data sizes use 1024-based units.
      </Text>
    </Stack>
  );
}
