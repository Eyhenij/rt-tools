import baseConfig from '../../eslint.config.mjs';

/**
 * The stand is plain JavaScript run by node: the spec runner transpiles only what it loads itself.
 * Without this block the shared config would not parse the stand files at all.
 */
export default [
    ...baseConfig,
    {
        files: ['**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
    },
];
