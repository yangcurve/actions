import { type PrettierConfig } from '@trivago/prettier-plugin-sort-imports'

export default {
  semi: false,
  printWidth: 120,
  singleQuote: true,
  importOrder: [],
  importOrderSortSpecifiers: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
} satisfies PrettierConfig
