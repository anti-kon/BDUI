/** @type {import('@eslint/js').Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: ['node_modules/', '**/dist/', '**/.bdui-build.*'],
  overrides: [
    {
      files: ['**/*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}'],
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: require('@typescript-eslint/parser'),
        parserOptions: {
          project: false,
          ecmaFeatures: { jsx: true },
        },
      },
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
      plugins: {
        react: require('eslint-plugin-react'),
        'react-hooks': require('eslint-plugin-react-hooks'),
        import: require('eslint-plugin-import'),
        'simple-import-sort': require('eslint-plugin-simple-import-sort'),
        '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      },
      extends: [
        require.resolve('@eslint/js'),
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:jsonc/recommended-with-jsonc',
        'plugin:jsonc/prettier',
        'plugin:react/jsx-runtime',
        'prettier',
      ],
      settings: {
        react: { version: 'detect' },
        'import/resolver': {
          typescript: true,
          node: true,
        },
      },
    },
    {
      files: ['**/*.{json,jsonc}'],
      plugins: { jsonc: require('eslint-plugin-jsonc') },
      extends: ['plugin:jsonc/recommended-with-jsonc', 'plugin:jsonc/prettier'],
    },
  ],
  reportUnusedDisableDirectives: true,
};
