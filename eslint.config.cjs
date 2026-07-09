const nx = require('@nx/eslint-plugin');
const rt = require('./tools/lint-rules/index.cjs');

module.exports = [
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

    // Nx flat presets — these wire angular-eslint v22 (flat) for TS + templates,
    // replacing the removed legacy `plugin:@nx/angular` / `plugin:@angular-eslint/recommended` configs.
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    ...nx.configs['flat/angular'],
    ...nx.configs['flat/angular-template'],

    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: ['tsconfig.base.json', 'tsconfig.json'],
            },
        },
    },

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

    {
        files: ['**/*.ts'],
        rules: {
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
            // Newly in angular-eslint v22 tsRecommended; 3 pre-existing components violate it.
            // Non-blocking during the framework bump — adopt OnPush as a separate follow-up.
            '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
        },
    },

    {
        files: ['**/*.html'],
        plugins: { rt },
        rules: {
            '@angular-eslint/template/banana-in-box': ['error'],
            '@angular-eslint/template/cyclomatic-complexity': [
                'error',
                {
                    maxComplexity: 25,
                },
            ],
            /* rule @angular-eslint/template/no-call-expression off until
             * https://github.com/angular-eslint/angular-eslint/issues/97 is closed
             * waiting for add ability to disable eslint rules in templates
             */
            '@angular-eslint/template/no-call-expression': 'off',
            '@angular-eslint/template/no-negated-async': 'error',

            // angular-eslint v22 added these a11y rules to templateRecommended; existing templates
            // predate them. Kept as warnings during the framework bump — adopt as a separate follow-up.
            '@angular-eslint/template/click-events-have-key-events': 'warn',
            '@angular-eslint/template/interactive-supports-focus': 'warn',

            // Custom BEM-only rule. Warn while templates still use
            // raw class= / [class.x] for the Material bridge; bump to error after migration.
            'rt/require-bem-directives': 'warn',
        },
    },

    {
        files: ['**/*.spec.ts', '**/*.spec.js'],
        rules: {},
    },

    {
        files: ['**/bem/*.directive.ts'],
        rules: {
            '@angular-eslint/prefer-inject': 'off',
        },
    },

    {
        // Custom workspace rules (rt-tools conventions).
        // The TS parser/projectService is contributed by the nx flat/typescript preset above.
        files: ['**/*.ts'],
        ignores: ['**/*.spec.ts', '**/*.spec.js'],
        plugins: { rt },
        rules: {
            // 0 violations in the current codebase → safe at error.
            'rt/require-source-suffix-for-subjects': 'error',
            // 0 violations after adding take(1) to the idb-storage / aside subscriptions and
            // disabling the rule on the non-RxJS Redux DevTools .subscribe(). Enforced at error.
            'rt/require-take-until-destroyed': 'error',
            // 0 violations after fixing 13 components that used rtMod without importing
            // ModDirective (modifiers were silently dropped at runtime). Enforced at error.
            'rt/require-mod-directive-import': 'error',
            // rt-tools uses string-literal `host: { class: '...' }` (not a BEM_BLOCK const) and
            // only on some components — warn to surface, not break, until a convention decision.
            'rt/require-host-bem-block': 'warn',
        },
    },
];
