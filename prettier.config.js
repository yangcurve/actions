// configs/prettier.config.ts
var config = {
  semi: false,
  singleQuote: true,
  printWidth: 120,
  experimentalTernaries: true,
  importOrder: [],
  plugins: ["@trivago/prettier-plugin-sort-imports"]
};
var prettier_config_default = config;
export {
  prettier_config_default as default
};
