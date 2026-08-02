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
     * Scoped to `lib/functions`, where every function owns a directory holding its source, its spec
     * and a CONTEXT.md. Reading the sources rather than only what a spec happened to import is what
     * makes the threshold below a real gate: a function added without a spec reports 0% instead of
     * being absent from the report. Barrels are pure re-exports and carry nothing to cover.
     *
     * `helpers/` and `interfaces/` have no tests yet and are deliberately out of both the report and
     * the gate; widen this list once they do, rather than lowering the threshold.
     */
    collectCoverageFrom: ['src/lib/functions/**/*.ts', '!src/lib/functions/**/index.ts', '!src/lib/functions/**/*.spec.ts'],
    /**
     * Gates exactly what is collected above. A path- or glob-keyed threshold would read more
     * precisely, but jest resolves those keys against the working directory, which differs between
     * running the target through nx and running jest in the project folder — the key then matches
     * nothing and the run fails with "coverage data was not found" instead of gating anything.
     */
    coverageThreshold: {
        global: {
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
