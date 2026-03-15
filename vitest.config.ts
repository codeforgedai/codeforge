import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/shared',
      'packages/db',
      'packages/execution',
      'packages/server',
      'packages/worker',
      'packages/cli',
    ],
  },
});
