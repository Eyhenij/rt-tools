const { FlatCompat } = require('@eslint/eslintrc');
const nxEslintPlugin = require('@nx/eslint-plugin');
const js = require('@eslint/js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

module.exports = [
    {
        ignores: [],
    },
    { plugins: { '@nx': nxEslintPlugin, eslintPluginPrettierRecommended } },
    {
        files: ['**/*.ts', '**/*.js'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: [],
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*'],
                        },
                    ],
                },
            ],
        },
    },
    ...compat
        .config({
            extends: [
                'plugin:@nx/typescript',
                'plugin:@nx/angular',
                'eslint:recommended',
                'plugin:@typescript-eslint/eslint-recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:@angular-eslint/template/process-inline-templates',
            ],
            parserOptions: {
                project: ['tsconfig.base.json', 'tsconfig.json'],
            },
        })
        .map((config) => ({
            ...config,
            files: ['**/*.ts'],
            rules: {
                ...config.rules,

                'semi-spacing': [
                    'error',
                    {
                        before: false,
                        after: true,
                    },
                ],
                'arrow-spacing': [
                    'error',
                    {
                        before: true,
                        after: true,
                    },
                ],
                'space-infix-ops': ['error'],
                'semi-style': ['error', 'last'],
                semi: ['error', 'always'],
                quotes: ['error', 'single'],
                'no-bitwise': ['error'],
                'template-curly-spacing': ['error', 'never'],
                'object-curly-spacing': ['error', 'always'],
                'spaced-comment': ['error', 'always'],
                'prefer-const': ['error'],
                'no-console': ['error'],
                'no-debugger': ['error'],
                'no-var': ['error'],
                'no-unused-expressions': ['warn'],
                'no-undef-init': ['error'],
                'no-eval': ['error'],
                'no-throw-literal': 'off',
                'no-fallthrough': ['error'],
                'no-invalid-this': ['error'],
                'no-extra-boolean-cas': 'off',
                'no-multiple-empty-lines': ['error'],
                'constructor-super': ['error'],
                'no-duplicate-case': ['error'],
                'no-cond-assign': ['error'],
                'no-extra-boolean-cast': 'off',
                'dot-notation': 'off',
                '@typescript-eslint/dot-notation': ['warn'],
                '@typescript-eslint/no-empty-interface': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/no-inferrable-types': 'off',
                '@typescript-eslint/no-namespace': 'off',
                '@typescript-eslint/no-unused-vars': ['error'],
                '@typescript-eslint/no-use-before-define': ['error'],
                '@typescript-eslint/no-unnecessary-type-assertion': ['error'],
                '@typescript-eslint/consistent-indexed-object-style': 'off',
                '@typescript-eslint/explicit-function-return-type': ['error'],
                '@typescript-eslint/prefer-function-type': ['error'],
                '@typescript-eslint/explicit-member-accessibility': [
                    'error',
                    {
                        accessibility: 'explicit',
                        overrides: {
                            accessors: 'explicit',
                            constructors: 'no-public',
                            methods: 'explicit',
                            properties: 'explicit',
                            parameterProperties: 'explicit',
                        },
                    },
                ],
                '@typescript-eslint/typedef': [
                    'error',
                    {
                        // 'callSignature': true,
                        parameter: true,
                        arrowParameter: true,
                        propertyDeclaration: true,
                        variableDeclaration: true,
                        memberVariableDeclaration: true,
                        objectDestructuring: false,
                        arrayDestructuring: true,
                    },
                ],
                '@typescript-eslint/type-annotation-spacing': ['off'],
                '@typescript-eslint/member-ordering': [
                    'error',
                    {
                        default: {
                            memberTypes: [
                                'private-instance-field',
                                'private-static-field',
                                'protected-instance-field',
                                'protected-static-field',
                                'protected-abstract-field',
                                'public-instance-field',
                                'public-abstract-field',
                                'public-static-field',
                                'signature',
                                'public-constructor',
                                'protected-constructor',
                                'private-constructor',
                                'public-instance-method',
                                'public-static-method',
                                'public-abstract-method',
                                'protected-instance-method',
                                'protected-static-method',
                                'protected-abstract-method',
                                'private-static-method',
                                'private-instance-method',
                            ],
                        },
                    },
                ],
                '@angular-eslint/no-output-native': ['error'],
                '@angular-eslint/no-output-on-prefix': ['error'],
                '@angular-eslint/no-output-rename': ['error'],
                '@angular-eslint/no-input-rename': ['error'],
                '@angular-eslint/prefer-output-readonly': ['error'],
            },
        })),
    ...compat.config({ extends: ['plugin:@nx/javascript'] }).map((config) => ({
        ...config,
        files: ['**/*.js'],
        rules: {
            ...config.rules,
        },
    })),
    ...compat.config({ extends: ['plugin:@nx/angular-template'] }).map((config) => ({
        ...config,
        files: ['**/*.html'],
        rules: {
            '@angular-eslint/template/banana-in-box': ['error'],
            '@angular-eslint/template/cyclomatic-complexity': [
                'error',
                {
                    maxComplexity: 8,
                },
            ],
            /* rule @angular-eslint/template/no-call-expression off until
             * https://github.com/angular-eslint/angular-eslint/issues/97 is closed
             * waiting for add ability to disable eslint rules in templates
             */
            '@angular-eslint/template/no-call-expression': 'off',
            '@angular-eslint/template/no-negated-async': 'error',
        },
    })),
    ...compat.config({ env: { jest: true } }).map((config) => ({
        ...config,
        files: ['**/*.spec.ts', '**/*.spec.js'],
        rules: {
            ...config.rules,
        },
    })),
    {
        ignores: [
            '**/.angular/**',
            '**/node_modules/**',
            '**/dist/**',
            '**/tmp/**',
            '**/coverage/**',

            '**/test-setup.ts',
            '**/jest.config.js',
            '**/jest.config.ts',
            '**/jest.preset.js',
            '**/jest.setup.js',
            '**/karma.conf.js',
            '**/protractor.conf.js',

            '**/.storybook',
        ],
    },
];
