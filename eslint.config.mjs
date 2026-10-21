import js from '@eslint/js';
import next from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'public/**',
      'next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', '*.config.{ts,mjs}'],
    plugins: { '@next/next': next, 'react-hooks': reactHooks },
    rules: {
      'no-undef': 'off',
      ...next.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
);
