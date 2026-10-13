/**
 * Plain ts-jest on Node: the server package runs under NestJS, not Angular. NestJS 12 and `jose`
 * ship ES modules only, so the run loads the specs as ES modules too; the test target starts Jest
 * with `--experimental-vm-modules` for that.
 */
export default {
    displayName: 'auth-server',
    preset: '../../jest.preset.cjs',
    testEnvironment: 'node',
    coverageDirectory: '../../coverage/projects/auth-server',
    collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/*.spec.ts', '!src/lib/**/index.ts', '!src/lib/testing/**'],
    coverageThreshold: {
        global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                useESM: true,
            },
        ],
    },
};
