/**
 * Unit conversion across a few common categories. Linear categories convert via
 * a factor to a base unit; temperature is special-cased. Pure; works anywhere.
 */

export interface UnitDef {
  id: string;
  label: string;
  /** Multiply a value in this unit by `factor` to get the category's base unit. */
  factor: number;
}

export interface UnitCategory {
  id: string;
  label: string;
  units: UnitDef[];
}

export const CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    label: 'Length',
    units: [
      { id: 'mm', label: 'Millimetre', factor: 0.001 },
      { id: 'cm', label: 'Centimetre', factor: 0.01 },
      { id: 'm', label: 'Metre', factor: 1 },
      { id: 'km', label: 'Kilometre', factor: 1000 },
      { id: 'in', label: 'Inch', factor: 0.0254 },
      { id: 'ft', label: 'Foot', factor: 0.3048 },
      { id: 'yd', label: 'Yard', factor: 0.9144 },
      { id: 'mi', label: 'Mile', factor: 1609.344 },
    ],
  },
  {
    id: 'mass',
    label: 'Weight',
    units: [
      { id: 'mg', label: 'Milligram', factor: 0.001 },
      { id: 'g', label: 'Gram', factor: 1 },
      { id: 'kg', label: 'Kilogram', factor: 1000 },
      { id: 't', label: 'Tonne', factor: 1_000_000 },
      { id: 'oz', label: 'Ounce', factor: 28.349523125 },
      { id: 'lb', label: 'Pound', factor: 453.59237 },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    units: [
      { id: 'B', label: 'Byte', factor: 1 },
      { id: 'KB', label: 'Kilobyte', factor: 1024 },
      { id: 'MB', label: 'Megabyte', factor: 1024 ** 2 },
      { id: 'GB', label: 'Gigabyte', factor: 1024 ** 3 },
      { id: 'TB', label: 'Terabyte', factor: 1024 ** 4 },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    units: [
      { id: 's', label: 'Second', factor: 1 },
      { id: 'min', label: 'Minute', factor: 60 },
      { id: 'hr', label: 'Hour', factor: 3600 },
      { id: 'day', label: 'Day', factor: 86400 },
      { id: 'week', label: 'Week', factor: 604800 },
    ],
  },
];

/** Convert within a linear category by unit id. */
export function convertLinear(value: number, fromFactor: number, toFactor: number): number {
  return (value * fromFactor) / toFactor;
}

// --- Temperature (non-linear) ---

export const TEMPERATURE_UNITS = ['C', 'F', 'K'] as const;
export type TempUnit = (typeof TEMPERATURE_UNITS)[number];

function toCelsius(value: number, from: TempUnit): number {
  if (from === 'C') return value;
  if (from === 'F') return ((value - 32) * 5) / 9;
  return value - 273.15;
}

export function convertTemperature(value: number, from: TempUnit, to: TempUnit): number {
  const c = toCelsius(value, from);
  if (to === 'C') return c;
  if (to === 'F') return (c * 9) / 5 + 32;
  return c + 273.15;
}
