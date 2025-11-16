import { createConfig } from '@yangcurve/eslint'

export default createConfig({
  tsconfigRootDir: import.meta.dirname,
  prettierConfig: {
    printWidth: 120,
  },
})
