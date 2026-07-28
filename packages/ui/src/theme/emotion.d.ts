import '@emotion/react';
import type { AppTheme } from './theme';

// Make `props.theme` in every styled component strongly typed as our AppTheme.
// The empty interface is the required module-augmentation pattern for Emotion.
declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Theme extends AppTheme {}
}
