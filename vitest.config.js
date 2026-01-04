import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.js',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: ['node_modules/', 'src/__tests__/', 'e2e/', '*.config.js'],
      thresholds: {
        global: {
          branches: 50,
          functions: 50,
          lines: 60,
          statements: 60,
        },
      },
    },
  },
});
