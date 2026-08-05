/**
 * Обычный ts-jest, без пресета Angular: пакет — CLI на Node, и фреймворк в прогоне тестов
 * прятал бы зависимость от него, которой у пакета быть не должно.
 */
export default {
    displayName: 'agent-kit',
    preset: '../../jest.preset.cjs',
    testEnvironment: 'node',
    coverageDirectory: '../../coverage/projects/agent-kit',
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                useESM: false,
            },
        ],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
