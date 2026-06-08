export default {
    // NOTE: 'prettier-stylelint/config.js' removed — it ships stylelint v14 rules deleted in v16
    // (1700+ "Unknown rule" errors); stylelint-prettier plugin below covers prettier integration.
    // standard-scss brings postcss-scss syntax + scss rules.
    extends: ['stylelint-config-standard-scss', 'stylelint-config-idiomatic-order'],
    plugins: ['stylelint-scss', 'stylelint-prettier', './tools/stylelint-rules/no-hardcoded-design-tokens.cjs'],
    rules: {
        'at-rule-empty-line-before': [
            'always',
            {
                ignore: ['after-comment', 'blockless-after-same-name-blockless', 'first-nested'],
                ignoreAtRules: ['else'],
            },
        ],
        'at-rule-no-unknown': null,
        'function-name-case': [
            'lower',
            {
                ignoreFunctions: ['/^get.*$/'],
            },
        ],
        'no-descending-specificity': null,
        'rule-empty-line-before': [
            'always',
            {
                except: ['first-nested'],
                ignore: ['after-comment'],
            },
        ],
        'scss/at-rule-no-unknown': true,
        // generateCssVar / generateCssClrVar are the repo-wide camelCase generator convention
        'scss/at-function-pattern': null,
        'selector-pseudo-element-colon-notation': 'single',
        'selector-pseudo-element-no-unknown': [
            true,
            {
                ignorePseudoElements: ['ng-deep'],
            },
        ],
        'no-invalid-position-at-import-rule': null,
        // The kit uses BEM (block__elem--mod) + `.--state` modifier classes and styles
        // Material's .mdc-* internals — default kebab-case pattern rejects all of them.
        'selector-class-pattern': null,
        'prettier/prettier': true,
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['host'],
            },
        ],
    },
    overrides: [
        {
            // Component styles must consume tokens, not raw hex (palette lives in styles/base only)
            files: ['projects/ui-kit/src/lib/**/*.scss'],
            rules: {
                'color-no-hex': true,
                // Custom rule ported from kvaris: no hardcoded colors / magic numbers in
                // token-aware properties; allows var(--rt-*), --mat-*, --mdc-*, calc/min/max/clamp.
                // Warning-level while the kit migrates remaining hardcoded values to tokens.
                'rt-tools/no-hardcoded-design-tokens': [true, { severity: 'warning' }],
            },
        },
    ],
};
