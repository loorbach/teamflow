// eslint.config.mjs
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['.next/**', 'out/**', 'build/**', 'node_modules/**', 'coverage/**']),

  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,

  {
    rules: {
      // General code style
      // quotes: ['error', 'single', { avoidEscape: true }],
      // semi: ['error', 'always'],
      // 'no-console': 'warn', // warn instead of error

      // React-specific
      'react/jsx-key': 'error', // ensure keys on lists
      'react/react-in-jsx-scope': 'off', // Next 13+ doesn't need React import

      // Next.js-specific
      '@next/next/no-img-element': 'warn', // prefer <Image> but allow exceptions
      '@next/next/no-html-link-for-pages': 'error', // avoid broken <a> links to pages

      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off', // optional

      // Import ordering (requires eslint-plugin-import)
      // 'import/order': ['error', { alphabetize: { order: 'asc' }, 'newlines-between': 'always' }],
    },
  },
])
