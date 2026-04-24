import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  {
    ignores: [
      'node_modules/',
      'coverage/',
      '**/dist/**',
      '**/.bdui-build.*',
      '**/*.md',
      '**/*.lock',
      'package-lock.json',
      '**/package.json',
      '**/tsconfig*.json',
      'sandbox/**/contract.json',
      'sandbox/web-demo/vendor/**',
      'sandbox/web-demo/renderer-web/**',
      'examples/**/node_modules/**',
      'examples/**/dist/**',
      'examples/**/public/client.js',
      'examples/**/public/client.js.map',
      'examples/**/public/contract.json',
      '.eslintrc.*',
      '**/*.json',
      '**/*.jsonc',
      '.prettierrc.*',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    ...tseslint.configs.recommended[0],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-undef': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
    settings: { react: { version: 'detect' } },
  },
];
