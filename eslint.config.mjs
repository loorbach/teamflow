// eslint.config.mjs
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    'coverage/**',
  ]),

  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,

  {
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],

      'react/jsx-key': 'error',
      'react/react-in-jsx-scope': 'off',

      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'error',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
]);
