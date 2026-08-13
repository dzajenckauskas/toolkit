'use client';

import { useState } from 'react';
import { Button, Stack } from '@toolkit/ui';
import JwtDecoder from '@/components/tools/developer/JwtDecoder';
import JwtGenerator from '@/components/tools/developer/JwtGenerator';

type Mode = 'decode' | 'generate';

/**
 * The JWT tool shell: a Decode/Generate toggle over the existing decoder and
 * the new HMAC generator. Decode stays the default so the tool opens on the
 * common case (and existing decoder test ids keep working).
 */
export default function JwtTool() {
  const [mode, setMode] = useState<Mode>('decode');

  return (
    <Stack gap={4}>
      <Stack direction="row" gap={2} wrap>
        <Button
          type="button"
          variant={mode === 'decode' ? 'primary' : 'ghost'}
          onClick={() => setMode('decode')}
          data-testid="jwt-mode-decode"
        >
          Decode
        </Button>
        <Button
          type="button"
          variant={mode === 'generate' ? 'primary' : 'ghost'}
          onClick={() => setMode('generate')}
          data-testid="jwt-mode-generate"
        >
          Generate
        </Button>
      </Stack>

      {mode === 'decode' ? <JwtDecoder /> : <JwtGenerator />}
    </Stack>
  );
}
