/**
 * Plain ts-jest on Node: the contract has no framework, and a preset that pulls Angular into the
 * run would hide a framework dependency creeping into the sources.
 */
export default {
    displayName: 'cms-contract',
    preset: '../../jest.preset.cjs',
    testEnvironment: 'node',
    coverageDirectory: '../../coverage/projects/cms-contract',
    collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/*.spec.ts', '!src/lib/**/index.ts', '!src/lib/gen/**'],
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
