/**
 * Focus-timer helpers. Pure functions only; the interval/ticking lives in the
 * component. Phases follow a simple Pomodoro cycle.
 */

export type TimerPhase = 'focus' | 'break';

export const PHASE_MINUTES: Record<TimerPhase, number> = {
  focus: 25,
  break: 5,
};

export function phaseSeconds(phase: TimerPhase): number {
  return PHASE_MINUTES[phase] * 60;
}

export function nextPhase(phase: TimerPhase): TimerPhase {
  return phase === 'focus' ? 'break' : 'focus';
}

/** Format a non-negative second count as M:SS (or MM:SS). */
export function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
