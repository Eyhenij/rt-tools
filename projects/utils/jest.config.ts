export default {
    displayName: 'utils',
    preset: '../../jest.preset.cjs',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    coverageDirectory: '../../coverage/projects/utils',
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
        '^@angular/cdk/(.*)$': '<rootDir>/../../node_modules/@angular/cdk/fesm2022/$1.mjs',
        '^@angular/core/testing$': '<rootDir>/../../node_modules/@angular/core/fesm2022/testing.mjs',
        '^@angular/platform-browser/testing$': '<rootDir>/../../node_modules/@angular/platform-browser/fesm2022/testing.mjs',
    },
};
