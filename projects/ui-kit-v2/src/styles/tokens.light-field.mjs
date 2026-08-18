/* Назначения светлой темы: обёртка поля — подпись, подсказка, отказ и счётчик знаков.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`. */

export const lightField = [
    {
        lead: `    /* Form field (rt-field) — обёртка анатомии поля: label / help / hint / error /
       required-маркер / read-only значение. Визуал label+hint в стиле Tailwind
       form (мелкий medium label, muted hint). Компоненты потребляют только эти
       токены. */`,
        space: true,
        name: `--rt-field-gap`,
        value: `var(--rt-space-xs)`,
    },
    {
        name: `--rt-field-label-font-size`,
        value: `var(--rt-text-sm)`,
    },
    {
        name: `--rt-field-label-font-weight`,
        value: `var(--rt-font-weight-medium)`,
    },
    {
        name: `--rt-field-label-color`,
        value: `var(--rt-color-text-muted)`,
    },
    {
        name: `--rt-field-label-help-gap`,
        value: `var(--rt-space-xs)`,
    },
    {
        name: `--rt-field-hint-font-size`,
        value: `var(--rt-text-xs)`,
    },
    {
        name: `--rt-field-hint-color`,
        value: `var(--rt-color-text-muted)`,
    },
    {
        name: `--rt-field-error-font-size`,
        value: `var(--rt-text-xs)`,
    },
    {
        name: `--rt-field-error-color`,
        value: `var(--rt-color-state-danger)`,
    },
    {
        name: `--rt-field-required-color`,
        value: `var(--rt-color-state-danger)`,
    },
    {
        name: `--rt-field-value-font-size`,
        value: `var(--rt-text-sm)`,
    },
    {
        name: `--rt-field-value-color`,
        value: `var(--rt-color-text-primary)`,
    },
    {
        name: `--rt-field-value-empty-color`,
        value: `var(--rt-color-text-muted)`,
    },
];
