/* Назначения светлой темы: панель списка и полоса страниц — кнопки действий, подпись «отметить
   все» и вид rt-pagination, вместе с ответом тёмной темы в поле `dark`.

   Отделено от `tokens.light-forms.mjs` по длине файла; граница проведена по предмету: здесь то,
   что стоит вокруг таблицы, а не поля ввода.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`, он же собирает
   `light` из этой части и соседних. */

export const lightLists = [
    {
        lead: `    /* Кнопки действий на панели списка — свои и приложения. Свой вид оставляет их кнопками-
       значками без подъёма; материальный набор делает из них круглые кнопки действия первого кита. */`,
        space: true,
        name: `--rt-list-action-gap`,
        value: `var(--rt-space-sm)`,
    },
    {
        name: `--rt-list-action-divider-height`,
        value: `var(--rt-size-5)`,
    },
    {
        name: `--rt-list-action-radius`,
        value: `var(--rt-radius-md)`,
    },
    {
        name: `--rt-list-action-shadow`,
        value: `var(--rt-shadow-none)`,
    },
    {
        name: `--rt-list-action-shadow-hover`,
        value: `var(--rt-shadow-none)`,
    },
    {
        name: `--rt-list-action-icon-size`,
        value: `var(--rt-size-5)`,
    },
    {
        name: `--rt-list-action-color`,
        value: `var(--rt-color-text-primary)`,
        dark: `var(--rt-color-text-primary)`,
    },
    {
        name: `--rt-list-action-color-hover`,
        value: `var(--rt-color-text-primary)`,
        dark: `var(--rt-color-text-primary)`,
    },
    {
        name: `--rt-list-action-color-bg-hover`,
        value: `var(--rt-icon-button-color-bg-hover)`,
        dark: `var(--rt-icon-button-color-bg-hover)`,
    },
    {
        lead: `    /* Значки в таблице списка — кнопки строки отбора и действия строки. Свой вид оставляет их
       как есть; материальный набор даёт им 24px и серый темы, как у первого кита. */`,
        space: true,
        name: `--rt-list-table-icon-size`,
        value: `0px`,
    },
    {
        name: `--rt-list-table-icon-color`,
        value: `var(--rt-color-text-primary)`,
        dark: `var(--rt-color-text-primary)`,
    },
    {
        lead: `    /* Подпись флажка «отметить все» на панели списка: свой вид — текст, материальный набор —
       приглушённый серый первого кита. */`,
        space: true,
        name: `--rt-list-selector-label-color`,
        value: `var(--rt-color-text-primary)`,
        dark: `var(--rt-color-text-primary)`,
    },
    {
        lead: `    /* Полоса страниц rt-pagination: ячейка страницы, текущая страница, стрелки, подпись
       диапазона и поле размера. Свой вид — прежние значения; материальный набор делает из них
       полосу первого кита. */`,
        space: true,
        name: `--rt-pagination-justify`,
        value: `space-between`,
    },
    {
        name: `--rt-pagination-gap`,
        value: `var(--rt-space-md)`,
    },
    {
        name: `--rt-pagination-nav-gap`,
        value: `var(--rt-space-xs)`,
    },
    {
        name: `--rt-pagination-range-display`,
        value: `inline`,
    },
    {
        name: `--rt-pagination-box-size`,
        value: `var(--rt-space-xl)`,
    },
    {
        name: `--rt-pagination-box-radius`,
        value: `var(--rt-radius-md)`,
    },
    {
        name: `--rt-pagination-box-color-border`,
        value: `var(--rt-color-border-default)`,
        dark: `var(--rt-color-border-default)`,
    },
    {
        name: `--rt-pagination-box-color-text`,
        value: `var(--rt-color-text-primary)`,
        dark: `var(--rt-color-text-primary)`,
    },
    {
        name: `--rt-pagination-box-current-color-bg`,
        value: `var(--rt-color-bg-surface-subtle)`,
        dark: `var(--rt-color-bg-surface-subtle)`,
    },
    {
        name: `--rt-pagination-box-current-color-text`,
        value: `var(--rt-color-text-primary)`,
        dark: `var(--rt-color-text-primary)`,
    },
    {
        name: `--rt-pagination-box-current-color-border`,
        value: `var(--rt-color-border-strong)`,
        dark: `var(--rt-color-border-strong)`,
    },
    {
        name: `--rt-pagination-box-current-font-weight`,
        value: `var(--rt-font-weight-semibold)`,
    },
    {
        name: `--rt-pagination-arrow-size`,
        value: `var(--rt-control-height-sm)`,
    },
    {
        name: `--rt-pagination-arrow-radius`,
        value: `var(--rt-radius-md)`,
    },
    {
        name: `--rt-pagination-arrow-shadow`,
        value: `var(--rt-shadow-none)`,
    },
    {
        name: `--rt-pagination-arrow-color`,
        value: `var(--rt-color-text-primary)`,
        dark: `var(--rt-color-text-primary)`,
    },
    {
        name: `--rt-pagination-per-page-gap`,
        value: `var(--rt-space-sm)`,
    },
    {
        name: `--rt-pagination-per-page-label-white-space`,
        value: `normal`,
    },
    {
        name: `--rt-pagination-field-height`,
        value: `var(--rt-input-height-md)`,
    },
    {
        name: `--rt-pagination-field-radius`,
        value: `var(--rt-input-radius)`,
    },
    {
        name: `--rt-pagination-field-color-border`,
        value: `var(--rt-input-color-border)`,
        dark: `var(--rt-input-color-border)`,
    },
    {
        name: `--rt-pagination-field-padding-x`,
        value: `var(--rt-input-padding-x)`,
    },
    {
        name: `--rt-pagination-field-color-bg`,
        value: `var(--rt-input-color-bg)`,
        dark: `var(--rt-input-color-bg)`,
    },
    {
        name: `--rt-pagination-field-color-text`,
        value: `var(--rt-input-color-text)`,
        dark: `var(--rt-input-color-text)`,
    },
];
