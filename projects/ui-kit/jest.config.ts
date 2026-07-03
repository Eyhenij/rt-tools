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
    },
};
