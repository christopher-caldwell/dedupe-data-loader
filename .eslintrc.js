const prettierrc = require('rc')('./prettier')

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 2,
    'prettier/prettier': ['error', prettierrc],
    'import/no-extraneous-dependencies': 'off',
  },
}
