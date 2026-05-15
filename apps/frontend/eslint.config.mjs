import baseConfig from '@repo/config/eslint/base.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['src/components/ui/**'],
  },
  {
    files: ['vite.config.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];
