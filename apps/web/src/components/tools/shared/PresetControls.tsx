'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Button, Stack, Text, TextInput } from '@toolkit/ui';
import { deletePreset, listPresets, savePreset, type Preset } from '@toolkit/lib/settings';

const NameInput = styled(TextInput)({ width: '14rem' });

interface Props<T> {
  /** Namespaces the preset list — each tool keeps its own set. */
  tool: string;
  /** The tool's current settings; saved as-is under the typed name. */
  settings: T;
  /** Applies a loaded preset's settings back into the tool. */
  onApply: (settings: T) => void;
  testIdPrefix: string;
}

/**
 * Named, reusable settings combinations for an image tool (e.g. "Etsy
 * listing: WebP @ 80%") — save the current controls under a name, then
 * reapply them later from the dropdown. Presets are client-only
 * (localStorage), namespaced per tool by `@toolkit/lib/settings`.
 */
export function PresetControls<T>({ tool, settings, onApply, testIdPrefix }: Props<T>) {
  const [presets, setPresets] = useState<Preset<T>[]>([]);
  const [name, setName] = useState('');

  // Presets are read from localStorage, so this must happen client-side only
  // (avoids an SSR/hydration mismatch); an empty list until then is correct.
  useEffect(() => {
    setPresets(listPresets<T>(tool));
  }, [tool]);

  const selected = presets.find((preset) => preset.name === name);

  const apply = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;
    setName(preset.name);
    onApply(preset.settings);
  };

  const save = () => {
    if (!name.trim()) return;
    savePreset(tool, name, settings);
    setPresets(listPresets<T>(tool));
  };

  const remove = () => {
    if (!selected) return;
    deletePreset(tool, selected.name);
    setPresets(listPresets<T>(tool));
    setName('');
  };

  return (
    <Stack gap={2}>
      <Text weight={600} size="sm">
        Presets
      </Text>
      <Stack direction="row" gap={2} wrap align="flex-end">
        <select
          value={selected ? selected.name : ''}
          onChange={(event) => apply(event.target.value)}
          aria-label="Load a saved preset"
          data-testid={`${testIdPrefix}-preset-select`}
        >
          <option value="">Saved presets…</option>
          {presets.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
        <NameInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Preset name"
          aria-label="Preset name"
          data-testid={`${testIdPrefix}-preset-name`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={save}
          disabled={!name.trim()}
          data-testid={`${testIdPrefix}-preset-save`}
        >
          Save preset
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={remove}
          disabled={!selected}
          data-testid={`${testIdPrefix}-preset-delete`}
        >
          Delete
        </Button>
      </Stack>
    </Stack>
  );
}
