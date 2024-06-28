module.exports = {
    root: true,
    env: {
        node: true,
    },
    parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        project: './tsconfig.eslint.json',
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'airbnb-base',
        'airbnb-typescript/base',
    ],
    plugins: [
        'import',
        '@typescript-eslint',
        'modules-newlines',
    ],
    rules: {
        indent: 'off',
        '@typescript-eslint/indent': ['error', 4, {
            SwitchCase: 1,
        }],
        'class-methods-use-this': 'off',
        'import/prefer-default-export': 'off',
        'modules-newlines/import-declaration-newline': 'error',
        'modules-newlines/export-declaration-newline': 'error',
    },
};
