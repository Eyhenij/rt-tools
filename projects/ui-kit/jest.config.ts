/* eslint-disable */
export default {
    displayName: 'rt-ui-kit',
    preset: '../../jest.preset.cjs',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    coverageDirectory: '../../coverage/rt-ui-kit',
    passWithNoTests: true,
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
    snapshotSerializers: [
        'jest-preset-angular/build/serializers/no-ng-attributes',
        'jest-preset-angular/build/serializers/ng-snapshot',
        'jest-preset-angular/build/serializers/html-comment',
    ],
    moduleNameMapper: {
        '^@angular/cdk/([\\w-]+)$': '<rootDir>/../../node_modules/@angular/cdk/fesm2022/$1.mjs',
        '^@angular/material/([\\w-]+)$': '<rootDir>/../../node_modules/@angular/material/fesm2022/$1.mjs',
        // Without these, jest resolves the sibling packages through node_modules and the specs run
        // against the last published versions instead of the working tree — a change in core or
        // utils would look green here while being untested. The compiler already maps them to
        // source via tsconfig paths; this keeps the runtime in step.
        '^@rt-tools/core$': '<rootDir>/../core/src/index.ts',
        '^@rt-tools/store$': '<rootDir>/../store/src/index.ts',
        '^@rt-tools/utils$': '<rootDir>/../utils/src/index.ts',
        // @rt-tools/utils writes explicit .js extensions on its relative imports so its ESM output
        // is loadable by Node. Jest resolves the TypeScript sources, so the extension is stripped.
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
