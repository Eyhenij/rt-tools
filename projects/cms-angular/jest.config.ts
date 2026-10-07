/* eslint-disable */
export default {
    displayName: 'rt-cms-angular',
    preset: '../../jest.preset.cjs',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    coverageDirectory: '../../coverage/rt-cms-angular',
    roots: ['<rootDir>/src', '<rootDir>/admin/src', '<rootDir>/site/src'],
    collectCoverageFrom: ['{src,admin/src,site/src}/lib/**/*.ts', '!**/*.spec.ts', '!**/testing/**'],
    coverageThreshold: {
        global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    // Connect, protobuf and DOMPurify ship ESM in files with the .js extension; without the
    // transform Node reads them untouched and stops at the first `export`.
    transformIgnorePatterns: ['node_modules/(?!(?:.*\\.mjs$|.*@connectrpc.*|.*@bufbuild.*|.*dompurify.*))'],
    moduleNameMapper: {
        // The specs run against the working tree, not against the last published versions.
        '^@rt-tools/cms-contract$': '<rootDir>/../cms-contract/src/index.ts',
        '^@rt-tools/cms-angular$': '<rootDir>/src/public-api.ts',
        // The contract writes explicit .js extensions on its relative imports; Jest resolves the
        // TypeScript sources, so the extension is stripped.
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
