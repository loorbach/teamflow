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
      // General code style
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-console': 'warn', // warn instead of error

      // React-specific
      'react/jsx-key': 'error', // keys in lists
      'react/react-in-jsx-scope': 'off', // not needed in Next 13+

      // Next.js-specific
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'error',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Import order (requires eslint-plugin-import)
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc' },
          'newlines-between': 'always',
        },
      ],
    },
  },
]);
