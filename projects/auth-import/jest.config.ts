/**
 * Plain ts-jest on Node: the command runs in a terminal, and a preset that pulls Angular into the
 * run would hide a framework dependency creeping into the sources.
 */
export default {
    displayName: 'auth-import',
    preset: '../../jest.preset.cjs',
    testEnvironment: 'node',
    coverageDirectory: '../../coverage/projects/auth-import',
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    // The sources write explicit .js extensions on relative imports for Node; Jest resolves the
    // TypeScript files, so the extension is stripped.
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
