// configs/eslint.config.ts
import globals from "globals";
import tsEslint from "typescript-eslint";
var config = [
  ...tsEslint.configs.recommended,
  { files: ["**/*.{ts}"] },
  { ignores: ["node_modules", "dist"] },
  { languageOptions: { globals: globals.browser } },
  {
    rules: {
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports"
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ]
    }
  }
];
var eslint_config_default = config;
export {
  eslint_config_default as default
};
