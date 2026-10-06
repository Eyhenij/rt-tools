/* eslint-disable */
export default {
    displayName: 'auth-keycloak-theme',
    preset: '../../jest.preset.cjs',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    coverageDirectory: '../../coverage/projects/auth-keycloak-theme',
    transform: {
        '^.+\\.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    // Keycloakify and its helper ship ESM in plain `.js` files; without the transform the first
    // import stops on `export`.
    transformIgnorePatterns: ['node_modules/(?!(?:.*\\.mjs$|.*keycloakify.*|.*tsafe.*|.*@jsverse.*))'],
    moduleNameMapper: {
        '^@angular/cdk/([\\w-]+)$': '<rootDir>/../../node_modules/@angular/cdk/fesm2022/$1.mjs',
        // The theme runs against the kit and the core of this tree, not their last published
        // versions: a change there must turn the theme red here.
        '^@rt-tools/core$': '<rootDir>/../core/src/index.ts',
        '^@rt-tools/utils$': '<rootDir>/../utils/src/index.ts',
        '^@rt-tools/ui-kit-v2$': '<rootDir>/../ui-kit-v2/src/public-api.ts',
        // The mock contexts import it; it reads `import.meta`, which a CommonJS run cannot load.
        '^(?:\\.\\./)+lib/BASE_URL$': '<rootDir>/src/testing/keycloakify-base-url.ts',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
