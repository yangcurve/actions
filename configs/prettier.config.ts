import { type PrettierConfig as Config } from '@trivago/prettier-plugin-sort-imports'

const config = {
  semi: false,
  singleQuote: true,
  printWidth: 120,
  experimentalTernaries: true,
  importOrder: [],
  plugins: ['@trivago/prettier-plugin-sort-imports'],
} satisfies Config

export default config
