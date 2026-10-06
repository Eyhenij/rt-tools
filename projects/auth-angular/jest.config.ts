/* eslint-disable */
export default {
    displayName: 'rt-auth-angular',
    preset: '../../jest.preset.cjs',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    coverageDirectory: '../../coverage/rt-auth-angular',
    roots: ['<rootDir>/src', '<rootDir>/connect/src'],
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    // keycloak-js and Connect ship ESM in files with the .js extension; without the transform Node
    // reads them untouched and stops at the first `export`.
    transformIgnorePatterns: ['node_modules/(?!(?:.*\\.mjs$|.*keycloak-js.*|.*@connectrpc.*|.*@bufbuild.*))'],
    moduleNameMapper: {
        // The specs run against the working tree, not against the last published versions.
        '^@rt-tools/auth-contract$': '<rootDir>/../auth-contract/src/index.ts',
        '^@rt-tools/auth-angular$': '<rootDir>/src/public-api.ts',
        // The contract writes explicit .js extensions on its relative imports; Jest resolves the
        // TypeScript sources, so the extension is stripped.
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
