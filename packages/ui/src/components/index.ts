// Barrel of UI primitives. Pure re-exports only (no side effects), so tree
// shaking still drops anything unused. When a second tool needs these, this
// folder lifts out to packages/ui with the same import surface (ADR-006).
export { Button, ButtonLink, ButtonVisual, DownloadLink } from './Button';
export type { ButtonStyleProps, ButtonVariant, ButtonSize } from './buttonStyles';
export { Stack } from './Stack';
export type { StackProps } from './Stack';
export { Card } from './Card';
export type { CardProps } from './Card';
export { Text } from './Text';
export type { TextProps } from './Text';
export { VisuallyHidden } from './VisuallyHidden';
export { Page } from './Page';
export { Heading } from './Heading';
