import next from 'eslint-config-next/core-web-vitals';

// ESLint 9+ flat config. `next lint` was removed in Next 16, so ESLint is
// invoked directly. eslint-config-next 16 ships native flat-config arrays, so
// we spread `core-web-vitals` straight in (no FlatCompat shim needed).
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
  ...next,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
];

export default eslintConfig;
