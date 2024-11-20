export default {
    extends: ['stylelint-config-standard', './node_modules/prettier-stylelint/config.js', 'stylelint-config-idiomatic-order'],
    plugins: ['stylelint-scss', 'stylelint-prettier'],
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
        'selector-pseudo-element-colon-notation': 'single',
        'selector-pseudo-element-no-unknown': [
            true,
            {
                ignorePseudoElements: ['ng-deep'],
            },
        ],
        'no-invalid-position-at-import-rule': null,
        'prettier/prettier': true,
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['host'],
            },
        ],
    },
};
