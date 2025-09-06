import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    js.configs.recommended,
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "dist/**",
            "coverage/**",
            "*.d.ts",
        ],
    },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.jest,
            },
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "no-console": ["warn", { "allow": ["warn", "error"] }],
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.jest,
            },
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
        },

    settings: {
        "import/resolver": {
            typescript: {
                alwaysTryTypes: true,
            },
        },
    },

        rules: {
            ...typescriptEslint.configs.recommended.rules,
            "no-restricted-imports": ["error", {
                patterns: [{
                    group: ["../../../packages/*/src/*"],
                    message: "Use workspace package names (@emma/*) instead of relative paths to packages.",
                }],
            }],
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/explicit-function-return-type": "off", // Too strict for React components
            "@typescript-eslint/no-non-null-assertion": "warn",
            "prefer-const": "error",
            "no-var": "error",
            "no-console": ["warn", { "allow": ["warn", "error"] }],

        "import/order": ["error", {
            groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
            "newlines-between": "always",

            pathGroups: [{
                pattern: "@/**",
                group: "internal",
            }, {
                pattern: "@emma/**",
                group: "internal",
            }],

            pathGroupsExcludedImportTypes: ["builtin"],
        }],

        "react/jsx-curly-brace-presence": ["error", "never"],
        "react/self-closing-comp": "error",
    },
},
{
    files: ["**/*.{ts,tsx}"],
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
    },
    rules: {
        ...typescriptEslint.configs.recommended.rules,
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/no-non-null-assertion": "warn",
    },
}];