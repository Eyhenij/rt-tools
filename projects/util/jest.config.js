export default {
    testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
    preset: 'jest-preset-angular',
    moduleFileExtensions: ['ts', 'js', 'html'],
    transformIgnorePatterns: ['node_modules/(?!dayjs|.*\\.mjs$)'],
    moduleNameMapper: {
        '^projects/(.*)$': '<rootDir>/projects/$1',
        '^src/(.*)$': '<rootDir>/src/$1',
        '^app/(.*)$': '<rootDir>/src/app/$1',
        '^assets/(.*)$': '<rootDir>/src/assets/$1',
    },
    coverageDirectory: '<rootDir>/coverage',
    coverageReporters: ['html', 'text-summary', 'cobertura'],
    collectCoverageFrom: ['projects/util/src/public-api.ts'],
};
