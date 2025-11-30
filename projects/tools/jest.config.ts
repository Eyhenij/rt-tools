/* eslint-disable */
export default {
    displayName: 'rt-tools',
    preset: '../../jest.preset.cjs',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    coverageDirectory: '../../coverage/rt-tools',
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
        '^@angular/cdk/overlay$': '<rootDir>/../../node_modules/@angular/cdk/fesm2022/overlay.mjs',
        '^@angular/cdk/layout$': '<rootDir>/../../node_modules/@angular/cdk/fesm2022/layout.mjs',
        '^@angular/cdk/coercion$': '<rootDir>/../../node_modules/@angular/cdk/fesm2022/coercion.mjs',
        '^@angular/cdk/portal$': '<rootDir>/../../node_modules/@angular/cdk/fesm2022/portal.mjs',
    },
};
