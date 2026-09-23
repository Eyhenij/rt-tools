import ng from '@angular-eslint/eslint-plugin';
import ngTemplate from '@angular-eslint/eslint-plugin-template';
import ngParser from '@angular-eslint/template-parser';
import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import angular from 'angular-eslint';
import globals from 'globals';
import { fileURLToPath } from 'node:url';

// base.config.mjs лежит в <repo>/eslint/, поэтому до корня воркспейса
// поднимаемся на уровень вверх — tsconfigRootDir должен указывать на корень.
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

/**
 * angular-eslint v22 не имеет legacy `.configs.recommended` на суб-плагинах;
 * пресеты живут на umbrella-пакете как flat-config массивы. Схлопываем массив
 * обратно в единую rules-карту для спреда (плагины/парсер уже зарегистрированы).
 */
const flatRules = (flatConfigs) => Object.assign({}, ...flatConfigs.map((config) => config.rules ?? {}));

/**
 * Базовый TypeScript-конфиг: парсер, globals, стилистические и type-aware правила,
 * member-ordering, accessibility. НЕ содержит `@nx/enforce-module-boundaries` и
 * workspace-правил — те подключаются отдельными блоками в eslint.config.mjs.
 */
export const baseTypeScriptConfig = {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.ts'],
    plugins: {
        '@typescript-eslint': ts,
        '@angular-eslint': ng,
        '@nx': nx,
    },
    languageOptions: {
        parser: tsParser,
        globals: {
            ...globals.browser,
            // Angular i18n рантайм-глобал ($localize`...`) на сайте.
            $localize: 'readonly',
        },
        parserOptions: {
            // Корневые скрипты и обвязка не входят ни в один tsconfig-проект — парсим их
            // дефолтным проектом.
            projectService: {
                // Обвязка витрин уже стоит в tsconfig своего пакета, и второе объявление здесь
                // отбивает её разбор целиком: разбор отказывает строкой о двойном включении.
                // Страницы-обзоры второго кита, наоборот, ни в один tsconfig не входят.
                allowDefaultProject: [
                    'tools/*.ts',
                    'tools/*.mts',
                    'prisma.config.ts',
                    '*/*/docs/*.ts',
                    'projects/ui-kit/.storybook/main.ts',
                    'projects/ui-kit/.storybook/test-runner.ts',
                    'projects/ui-kit-v2/.storybook/test-runner.ts',
                    'projects/ui-kit-v2/.storybook/snapshot-evidence.ts',
                    'projects/ui-kit-v2/.storybook/snapshot-wait.ts',
                ],
            },
            tsconfigRootDir: repoRoot,
            ecmaVersion: 2022,
            warnOnUnsupportedTypeScriptVersion: true,
            projectFolderIgnoreList: ['**/node_modules/**', '**/dist/**', '**/tmp/**', '**/coverage/**', '**/.angular/**'],
            sourceType: 'module',
        },
    },
    rules: {
        ...js.configs.recommended.rules,
        ...ts.configs.recommended.rules,
        ...flatRules(angular.configs.tsRecommended),

        // Приставок здесь четыре, а не одна: два кита живут рядом в одном дереве и обязаны
        // различаться селектором — `rt-*` у второго, `rtui-*` у первого, — а экраны админки и
        // встраиваемой страницы переписок носят свои.
        '@angular-eslint/directive-selector': [
            'error',
            {
                type: 'attribute',
                prefix: ['rt', 'rtui', 'admin', 'talks'],
                style: 'camelCase',
            },
        ],
        '@angular-eslint/component-selector': [
            'error',
            {
                type: 'element',
                prefix: ['rt', 'rtui', 'admin', 'talks'],
                style: 'kebab-case',
            },
        ],
        'no-bitwise': ['error'],
        'spaced-comment': ['error', 'always'],
        curly: ['error', 'all'],
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
        'constructor-super': ['error'],
        'no-duplicate-case': ['error'],
        'no-cond-assign': ['error'],
        'no-extra-boolean-cast': 'off',
        'dot-notation': 'off',
        '@typescript-eslint/dot-notation': ['warn'],
        '@typescript-eslint/no-explicit-any': ['error'],
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-non-null-assertion': ['error'],
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
                parameter: true,
                arrowParameter: true,
                propertyDeclaration: true,
                variableDeclaration: true,
                memberVariableDeclaration: true,
                objectDestructuring: false,
                arrayDestructuring: true,
            },
        ],
        '@typescript-eslint/member-ordering': [
            'error',
            {
                default: {
                    memberTypes: [
                        // Приватные поля (#)
                        'private-instance-field',
                        'private-readonly-field',
                        'private-static-field',

                        // Protected поля
                        'protected-instance-field',
                        'protected-readonly-field',
                        'protected-static-field',
                        'protected-abstract-field',

                        // Public поля (inputs/outputs сначала, затем обычные)
                        'public-decorated-field',
                        'public-instance-field',
                        'public-readonly-field',
                        'public-static-field',
                        'public-abstract-field',

                        // Signature
                        'signature',

                        // Конструкторы
                        'public-constructor',
                        'protected-constructor',
                        'private-constructor',

                        // Методы: public → protected → private
                        'public-instance-method',
                        'public-static-method',
                        'public-abstract-method',
                        'protected-instance-method',
                        'protected-static-method',
                        'protected-abstract-method',
                        'private-instance-method',
                        'private-static-method',
                    ],
                },
            },
        ],
        '@angular-eslint/no-output-native': ['error'],
        '@angular-eslint/no-output-on-prefix': ['error'],
        '@angular-eslint/no-output-rename': ['error'],
        '@angular-eslint/no-input-rename': ['error'],
        '@angular-eslint/prefer-output-readonly': ['error'],
        '@angular-eslint/prefer-on-push-component-change-detection': ['warn'],
        '@angular-eslint/prefer-standalone': ['warn'],
    },
};

/**
 * Базовый Template-конфиг: recommended + accessibility наборы @angular-eslint/template
 * и self-closing-tags. Workspace-правила для шаблонов подключаются отдельным блоком.
 */
export const baseTemplateConfig = {
    files: ['**/*.html'],
    ignores: ['**/apps/*/src/index.html', '**/.storybook/*.html'],
    plugins: {
        '@angular-eslint/template': ngTemplate,
    },
    languageOptions: {
        parser: ngParser,
    },
    rules: {
        ...flatRules(angular.configs.templateRecommended),
        ...flatRules(angular.configs.templateAccessibility),
        '@angular-eslint/template/prefer-self-closing-tags': ['error'],
    },
};
