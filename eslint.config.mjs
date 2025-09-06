import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        files: ["**/*.{js,ts}"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        rules: {
            ...typescriptEslint.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "prefer-const": "error",
            "no-var": "error",
            "no-console": ["warn", { "allow": ["warn", "error"] }],
        },
    },
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/.next/**",
            "**/coverage/**",
            "**/*.d.ts",
        ],
    },
];
