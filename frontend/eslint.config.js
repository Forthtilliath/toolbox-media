import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    // *.d.ts/*.js here aren't hand-written source — tsconfig.node.json's
    // composite build emits them alongside vite.config.ts/playwright.config.ts/
    // e2e/** (already gitignored) purely as a build byproduct.
    ignores: [
      'dist',
      'playwright-report',
      'test-results',
      'blob-report',
      '**/*.d.ts',
      'vite.config.js',
      'playwright.config.js',
      'e2e/*.js',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, jsxA11y.flatConfigs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Every page follows the same "select file(s), submit, show result/error"
      // shape — an unused catch binding would only ever hide a real bug here.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Test/tooling files run under Node, not the browser, and Playwright's
    // own test/expect shadow the ones from Vitest's globals.
    files: ['**/*.test.{ts,tsx}', 'e2e/**/*.ts', 'vite.config.ts', 'playwright.config.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
)
