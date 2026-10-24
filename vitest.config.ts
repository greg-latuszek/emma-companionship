import path from 'node:path';
import { defineConfig } from 'vitest/config';
import { readLanguageChoices } from './src/i18n/read-language-choices';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    env: { LANGUAGE_CHOICES: JSON.stringify(readLanguageChoices()) },
    globals: true,
    include: ['src/**/*.test.ts', 'db/tests/**/*.test.ts'],
    testTimeout: 30000,
    fileParallelism: false,
  },
});
