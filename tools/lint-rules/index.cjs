'use strict';

/**
 * Кастомные ESLint-правила rt-tools.
 * Кастомные workspace-правила для конвенций rt-tools
 * (rtBlock/rtElem/rtMod, ModDirective, concatClasses, @rt-tools/core).
 *
 * Подключается в `eslint.config.cjs` как плагин `rt`:
 *   const rt = require('./tools/eslint-rules');
 *   { plugins: { rt }, rules: { 'rt/<name>': 'error' } }
 */
module.exports = {
    rules: {
        'require-take-until-destroyed': require('./rules/require-take-until-destroyed.cjs'),
        'require-source-suffix-for-subjects': require('./rules/require-source-suffix-for-subjects.cjs'),
        'require-host-bem-block': require('./rules/require-host-bem-block.cjs'),
        'require-mod-directive-import': require('./rules/require-mod-directive-import.cjs'),
        'require-bem-directives': require('./rules/require-bem-directives.cjs'),
    },
};
