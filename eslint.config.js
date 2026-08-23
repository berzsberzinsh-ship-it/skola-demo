import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
  js.configs.recommended,
  prettier, // ← this adds Prettier rules and disables conflicting ESLint rules
  {
    rules: {
      'prettier/prettier': 'error', // vai 'warn', ja gribi tikai dzeltenas brīdinājumus
      'linebreak-style': ['error', 'unix'], // vai 'windows', ja gribi CRLF
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      // add more custom rules later if you want
    },
  },
];
