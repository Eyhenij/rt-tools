/**
 * Plain ts-jest, not jest-preset-angular: the package has no framework to bootstrap, and a preset
 * that pulls Angular into the test run would mask a framework dependency creeping back into the
 * sources — the one thing this package must not have.
 */
export default {
    displayName: 'utils',
    preset: '../../jest.preset.cjs',
    testEnvironment: 'node',
    coverageDirectory: '../../coverage/projects/utils',
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
};
