'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text } from '@/components/ui';
import { formatClock, nextPhase, phaseSeconds, type TimerPhase } from '@/lib/timer';

const Clock = styled('div')(({ theme }) => ({
  fontSize: 'clamp(3rem, 12vw, 5rem)',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '0.02em',
  color: theme.color.text,
  textAlign: 'center',
}));

const PhaseLabel = styled('div')(({ theme }) => ({
  textAlign: 'center',
  fontSize: '0.85rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: theme.color.muted,
}));

export default function FocusTimer() {
  const [phase, setPhase] = useState<TimerPhase>('focus');
  const [remaining, setRemaining] = useState(phaseSeconds('focus'));
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // Advance to the next phase and continue running.
          setPhase((current) => {
            const next = nextPhase(current);
            setRemaining(phaseSeconds(next));
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [running]);

  const reset = useCallback(() => {
    setRunning(false);
    clear();
    setRemaining(phaseSeconds(phase));
  }, [phase]);

  const switchPhase = (next: TimerPhase) => {
    setRunning(false);
    clear();
    setPhase(next);
    setRemaining(phaseSeconds(next));
  };

  return (
    <Stack gap={4} align="center">
      <Stack direction="row" gap={2}>
        <Button
          type="button"
          variant={phase === 'focus' ? 'primary' : 'ghost'}
          onClick={() => switchPhase('focus')}
          data-testid="timer-focus"
        >
          Focus
        </Button>
        <Button
          type="button"
          variant={phase === 'break' ? 'primary' : 'ghost'}
          onClick={() => switchPhase('break')}
          data-testid="timer-break"
        >
          Break
        </Button>
      </Stack>

      <div>
        <PhaseLabel data-testid="timer-phase">{phase}</PhaseLabel>
        <Clock data-testid="timer-clock">{formatClock(remaining)}</Clock>
      </div>

      <Stack direction="row" gap={2}>
        <Button
          type="button"
          variant="primary"
          onClick={() => setRunning((r) => !r)}
          data-testid="timer-toggle"
        >
          {running ? 'Pause' : 'Start'}
        </Button>
        <Button type="button" variant="ghost" onClick={reset} data-testid="timer-reset">
          Reset
        </Button>
      </Stack>

      <Text tone="muted" size="sm">
        A simple Pomodoro timer: 25 minutes focus, 5 minutes break. Runs in your browser.
      </Text>
    </Stack>
  );
}
