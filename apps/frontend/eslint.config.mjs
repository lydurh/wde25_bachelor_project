import baseConfig from '@repo/config/eslint/base.mjs';

export default [
  ...baseConfig,
  {
    files: ['vite.config.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];
