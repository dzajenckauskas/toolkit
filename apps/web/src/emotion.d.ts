import '@emotion/react';
import type { AppTheme } from '@toolkit/ui';

// Strongly type `props.theme` in every styled component as the shared AppTheme.
// The augmentation lives in each consumer (as well as inside @toolkit/ui) so the
// app's own type-check sees it without depending on cross-package .d.ts pickup.
// The empty interface is the required module-augmentation pattern for Emotion.
declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Theme extends AppTheme {}
}
