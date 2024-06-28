module.exports = {
    parser: 'vue-eslint-parser',
    parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
    },
    extends: [
        'plugin:vue/vue3-recommended',
        '@vue/eslint-config-airbnb-with-typescript',
        'plugin:vuetify/base',
    ],
    plugins: [
        'vue',
    ],
    rules: {
        indent: 'off',
        'import/prefer-default-export': 'off',
        '@typescript-eslint/indent': ['error', 4, {
            SwitchCase: 1,
        }],
        'vue/component-tags-order': ['error', {
            order: ['script', 'template', 'style'],
        }],
    },
    overrides: [
        {
            files: ['*.vue'],
            rules: {
                '@typescript-eslint/indent': 'off',
                'vue/html-indent': ['error', 4],
                'vue/script-indent': ['error', 4, {
                    baseIndent: 1,
                    switchCase: 1,
                }],
            },
        },
    ],
};
