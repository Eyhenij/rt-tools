export default {
    displayName: 'core',
    preset: '../../jest.preset.cjs',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    coverageDirectory: '../../coverage/projects/core',
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
    moduleNameMapper: {
        // Without this, jest resolves sibling packages through node_modules and the specs run
        // against the last published version instead of the working tree — a change here would
        // look green while being untested. The compiler already maps these to source via
        // tsconfig paths; this keeps the runtime in step.
        '^@rt-tools/utils$': '<rootDir>/../utils/src/index.ts',
        // @rt-tools/utils writes explicit .js extensions on its relative imports so its ESM output
        // is loadable by Node. Jest resolves the TypeScript sources, so the extension is stripped.
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    snapshotSerializers: [
        'jest-preset-angular/build/serializers/no-ng-attributes',
        'jest-preset-angular/build/serializers/ng-snapshot',
        'jest-preset-angular/build/serializers/html-comment',
    ],
};
