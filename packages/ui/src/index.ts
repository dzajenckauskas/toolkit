/**
 * `@toolkit/ui` — the shared design system for the toolkit apps (ADR-006 / 009).
 *
 * One import surface for everything visual: the typed Emotion theme, the App
 * Router SSR provider, global styles, and the UI primitives. Pure re-exports
 * only (no side effects) so unused primitives still tree-shake away.
 */
export * from './components';

export { theme } from './theme/theme';
export type { AppTheme } from './theme/theme';

export { default as EmotionRegistry } from './theme/EmotionRegistry';
export { GlobalStyles } from './theme/GlobalStyles';
