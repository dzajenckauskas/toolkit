import { defineConfig } from 'vitest/config';

// Pure-logic + Web-API helpers. jsdom gives the handful of DOM/Storage-touching
// modules (settings, clipboard, image) a browser-like environment; there are no
// React component tests here, so no plugins or setup files are needed.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
