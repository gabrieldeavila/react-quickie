import { defineConfig } from 'vitest/config';

// Pure rules in src/domain only; nothing here imports `vscode`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/domain/**/*.spec.ts'],
  },
});
