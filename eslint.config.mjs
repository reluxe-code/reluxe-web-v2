// eslint.config.mjs
import js from '@eslint/js';
import next from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  // Ignore build outputs
  { ignores: ['**/.next/**', '**/node_modules/**', '**/out/**', '**/public/**'] },

  // Base recommended
  js.configs.recommended,

  // Project rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      import: importPlugin,
      'react-hooks': reactHooks,
      '@next/next': next,
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@', './src']],                     // your @ → src alias
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'] },
      },
    },
    rules: {
      'import/no-unresolved': ['error', { caseSensitive: true }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'off',           // flip to 'warn' if you prefer
    },
  },
];
