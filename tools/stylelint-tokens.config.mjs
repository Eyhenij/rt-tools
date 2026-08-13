/**
 * Конфиг проверки литералов в стилях второго кита.
 *
 * Правила `color-no-hex` и `rt-tools/no-hardcoded-design-tokens` навешаны здесь, а не в общем
 * `stylelint.config.js`, по одной причине: `lint:styles` зовёт stylelint по всем `projects/**`
 * с `--max-warnings 0`, а списка принятого у stylelint нет. Включи их там — и в первый же день
 * покраснеют двести с лишним накопленных мест, после чего правило снимут вместо того, чтобы
 * чинить. Набор судит своя проверка (`tools/check-tokens-styles.mjs`), она же сверяет находки
 * со списком принятого.
 *
 * Набор и его исключения названы договорённостью:
 * `docs/specs/ui-kit-v2/proposed/design-tokens/implementation.md`, раздел «Набор, который судят
 * проверки». Здесь он повторён строкой `files` — второго места, где он объявлен, нет.
 */
import base from '../stylelint.config.js';

export default {
    ...base,
    overrides: [
        ...(base.overrides ?? []),
        {
            files: ['projects/ui-kit-v2/src/lib/**/*.scss'],
            rules: {
                'color-no-hex': true,

                /* `customProperties` судит код цвета и в объявлении своего свойства блока.
                   Включено только здесь: у первого кита свои накопленные места, и его
                   проверки эта линия не трогает. */
                'rt-tools/no-hardcoded-design-tokens': [true, { customProperties: true }],
            },
        },
    ],
};
