module.exports = {
    parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
    },
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.eslint.json',
            },
        },
    },
};
