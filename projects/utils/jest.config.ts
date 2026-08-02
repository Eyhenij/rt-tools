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
    /**
     * Collect from the sources rather than only from what a spec happened to import, so a function
     * added without a spec shows up as 0% instead of being absent from the report — which is what
     * makes the threshold below a real gate. Barrels are pure re-exports and carry nothing to cover.
     */
    collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/index.ts', '!src/lib/**/*.spec.ts'],
    /**
     * Every function under `lib/functions` is fully covered and must stay that way: each one owns a
     * directory holding its source, its spec and a CONTEXT.md. The rest of the package is not gated
     * yet, hence a path-scoped threshold rather than a global one.
     */
    coverageThreshold: {
        '**/src/lib/functions/**/*.ts': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
};
