import { defineConfig } from 'vitest/config';

// The registry is pure data + helpers, so the default Node environment is enough.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
