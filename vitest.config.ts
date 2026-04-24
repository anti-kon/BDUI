import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['packages/**/src/**/*.{test,spec}.ts', 'packages/**/__tests__/**/*.ts'],
    exclude: ['**/dist/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/**/*.d.ts', 'packages/*/src/**/__tests__/**'],
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 50,
        lines: 50,
      },
    },
    environmentMatchGlobs: [['packages/renderer-web/**', 'happy-dom']],
  },
});
