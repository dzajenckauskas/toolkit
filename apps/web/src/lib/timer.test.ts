import { describe, expect, it } from 'vitest';
import { formatClock, nextPhase, phaseSeconds } from './timer';

describe('timer', () => {
  it('formats clock values as M:SS', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(9)).toBe('0:09');
    expect(formatClock(65)).toBe('1:05');
    expect(formatClock(1500)).toBe('25:00');
  });

  it('never formats a negative time', () => {
    expect(formatClock(-10)).toBe('0:00');
  });

  it('maps phases to durations', () => {
    expect(phaseSeconds('focus')).toBe(1500);
    expect(phaseSeconds('break')).toBe(300);
  });

  it('alternates phases', () => {
    expect(nextPhase('focus')).toBe('break');
    expect(nextPhase('break')).toBe('focus');
  });
});
