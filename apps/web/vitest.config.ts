import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Playwright specs live under e2e/ and must not be run by Vitest.
    exclude: ['node_modules', '.next', 'e2e'],
    // Pure logic is unit-tested in @toolkit/lib and @toolkit/tools; the app is
    // covered by Playwright e2e. This config stays for any future component
    // tests, so an empty run is a pass rather than an error.
    passWithNoTests: true,
  },
});
