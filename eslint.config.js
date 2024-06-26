import ng from '@angular-eslint/eslint-plugin';
import ngTemplate from '@angular-eslint/eslint-plugin-template';
import ngParser from '@angular-eslint/template-parser';
import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import html from 'eslint-plugin-html';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import rxjs from 'eslint-plugin-rxjs';
import globals from 'globals';

export default [
    eslintPluginPrettierRecommended,
    {
        files: ['**/*.ts'],
        plugins: {
            '@typescript-eslint': ts,
            '@angular-eslint': ng,
            rxjs,
        },
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                project: true,
                tsconfigRootDir: '.',
                ecmaVersion: 2022,
                createDefaultProgram: true,
                warnOnUnsupportedTypeScriptVersion: true,
                projectFolderIgnoreList: ['**/node_modules/**', '**/dist/**', '**/tmp/**', '**/coverage/**', '**/.angular/**'],
                sourceType: 'module',
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            ...ts.configs.recommended.rules,
            ...ng.configs.recommended.rules,
            ...rxjs.configs.recommended.rules,

            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: ['rtui', 'rt'],
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: ['app', 'rtui'],
                    style: 'kebab-case',
                },
            ],
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
            '@typescript-eslint/type-annotation-spacing': ['error'],
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
            'rxjs/no-internal': ['error'],
            'rxjs/no-async-subscribe': ['error'],
            'rxjs/no-nested-subscribe': ['error'],
            'rxjs/no-subject-unsubscribe': ['error'],
            'rxjs/no-unbound-methods': ['error'],
            'rxjs/no-unsafe-first': ['error'],
            'rxjs/no-implicit-any-catch': 'off',
            'rxjs/no-sharereplay': 'off',
        },
    },
    {
        files: ['**/*.html'],
        plugins: {
            '@angular-eslint/template': ngTemplate,
            html: html,
        },
        languageOptions: {
            parser: ngParser,
        },
        rules: {
            ...ngTemplate.configs.recommended.rules,
            ...ngTemplate.configs.accessibility.rules,
        },
    },
    {
        files: ['**/*.spec.ts'],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/tmp/**', '**/coverage/**', '**/.angular/**'],
    },
];
