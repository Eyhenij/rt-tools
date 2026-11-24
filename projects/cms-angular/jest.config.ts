/* eslint-disable */
export default {
    displayName: 'rt-cms-angular',
    preset: '../../jest.preset.cjs',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    coverageDirectory: '../../coverage/rt-cms-angular',
    roots: ['<rootDir>/src', '<rootDir>/admin/src', '<rootDir>/site/src'],
    // The decisions live in functions and stores and are held at full coverage; a component, a
    // directive and a pipe stay thin wrappers over them and are checked by the scenarios that draw them.
    collectCoverageFrom: [
        '{src,admin/src,site/src}/lib/**/*.ts',
        '!**/*.spec.ts',
        '!**/testing/**',
        '!**/*.component.ts',
        '!**/*.directive.ts',
        '!**/*.pipe.ts',
    ],
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
        // The kit too: the screens pass their slots as templates, and the published kit the package
        // installs has no template slots yet.
        '^@rt-tools/ui-kit-v2$': '<rootDir>/../ui-kit-v2/src/public-api.ts',
        '^@rt-tools/ui-kit-v2/rich-editor$': '<rootDir>/../ui-kit-v2/src/rich-editor/public-api.ts',
        '^@rt-tools/ui-kit-v2/core$': '<rootDir>/../ui-kit-v2/src/lib/core.ts',
        '^@rt-tools/ui-kit-v2/([\\w-]+)$': '<rootDir>/../ui-kit-v2/src/lib/components/$1/index.ts',
        '^@rt-tools/core$': '<rootDir>/../core/src/index.ts',
        '^@rt-tools/utils$': '<rootDir>/../utils/src/index.ts',
        '^@angular/cdk/([\\w-]+)$': '<rootDir>/../../node_modules/@angular/cdk/fesm2022/$1.mjs',
        // The contract writes explicit .js extensions on its relative imports; Jest resolves the
        // TypeScript sources, so the extension is stripped.
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
