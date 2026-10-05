/** Plain ts-jest on Node: the server package runs under NestJS, not Angular. */
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
    // `jose` ships ES modules only; the run transforms it like the sources instead of requiring it.
    transformIgnorePatterns: ['/node_modules/(?!(\\.pnpm/jose@[^/]+/node_modules/)?jose/)'],
    transform: {
        '^.+\\.[tj]s$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
};
