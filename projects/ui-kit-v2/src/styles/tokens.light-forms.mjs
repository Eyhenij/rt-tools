/* Назначения светлой темы: набор и контролы формы. Именованные отступы, кегль основного
   текста, единый контракт семейства полей ввода, выпадающая панель, кнопка-значок, счётчик и
   переключатель.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`. */

export const lightForms = [
    {
        lead: `    /* Spacing aliases — named semantic aliases на primitive numeric scale */`,
        space: true,
        name: `--rt-space-2xs`,
        value: `var(--rt-space-0-5)`,
        note: `2px`,
    },
    {
        name: `--rt-space-xs`,
        value: `var(--rt-space-1)`,
        note: `4px`,
    },
    {
        name: `--rt-space-sm`,
        value: `var(--rt-space-2)`,
        note: `8px`,
    },
    {
        name: `--rt-space-md`,
        value: `var(--rt-space-4)`,
        note: `16px`,
    },
    {
        name: `--rt-space-lg`,
        value: `var(--rt-space-6)`,
        note: `24px`,
    },
    {
        name: `--rt-space-xl`,
        value: `var(--rt-space-8)`,
        note: `32px`,
    },
    {
        name: `--rt-space-2xl`,
        value: `var(--rt-space-12)`,
        note: `48px`,
    },
    {
        name: `--rt-space-3xl`,
        value: `var(--rt-space-16)`,
        note: `64px`,
    },
    {
        lead: `    /* Text size base — semantic alias для default body text */`,
        space: true,
        name: `--rt-text-base`,
        value: `var(--rt-text-md)`,
    },
    {
        lead: `    /* Form input — composition tokens. Единый контракт для всего input-семейства
       (rt-input, rt-input-number, rt-autocomplete, rt-select, rt-multiselect,
       rt-textarea). Namespace --rt-input-* / --rt-textarea-*. Компоненты
       потребляют ТОЛЬКО эти токены, не primitives и не литералы. */

    /* Colors */`,
        space: true,
        name: `--rt-input-color-bg`,
        value: `var(--rt-color-bg-surface-subtle)`,
    },
    {
        name: `--rt-input-color-bg-disabled`,
        value: `var(--rt-color-bg-surface-subtle)`,
    },
    {
        name: `--rt-input-color-bg-hover`,
        value: `var(--rt-overlay-black-8)`,
        dark: `var(--rt-overlay-white-8)`,
    },
    {
        name: `--rt-input-color-border`,
        value: `var(--rt-color-border-default)`,
        dark: `var(--rt-charcoal-border)`,
    },
    {
        name: `--rt-input-color-border-focus`,
        value: `var(--rt-color-action-primary)`,
    },
    {
        name: `--rt-input-color-border-error`,
        value: `var(--rt-color-state-danger)`,
    },
    {
        name: `--rt-input-color-text`,
        value: `var(--rt-color-text-primary)`,
    },
    {
        name: `--rt-input-color-text-placeholder`,
        value: `var(--rt-color-text-muted)`,
    },
    {
        name: `--rt-input-icon-color`,
        value: `var(--rt-neutral-600)`,
        dark: `var(--rt-neutral-600)`,
    },
    {
        name: `--rt-input-icon-size`,
        value: `var(--rt-size-4)`,
    },
    {
        name: `--rt-input-gap`,
        value: `var(--rt-space-sm)`,
    },
    {
        lead: `    /* Sizes (single-line height scale) */`,
        space: true,
        name: `--rt-input-height-sm`,
        value: `var(--rt-control-height-sm)`,
    },
    {
        name: `--rt-input-height-md`,
        value: `var(--rt-control-height-md)`,
    },
    {
        name: `--rt-input-height-lg`,
        value: `var(--rt-control-height-lg)`,
    },
    {
        name: `--rt-input-height`,
        value: `var(--rt-input-height-md)`,
    },
    {
        lead: `    /* Кап ширины одиночного контрола (input/select) в тулбарах list-страниц —
       внутри flex-баров контрол без ограничения растягивается на всю строку. */`,
        space: true,
        name: `--rt-input-max-width`,
        value: `var(--rt-control-max-width)`,
    },
    {
        lead: `    /* Поиск списка (rt-data-list). Свои имена, а не имена поля: в материальном наборе поиск
       списка — поле Material первого кита, 52px высотой, со скруглением 4px и рамкой цвета
       outline темы, а остальные поля набора остаются полями первого кита вне Material. */`,
        space: true,
        name: `--rt-list-search-height`,
        value: `var(--rt-input-height-sm)`,
    },
    {
        name: `--rt-list-search-radius`,
        value: `var(--rt-input-radius)`,
    },
    {
        name: `--rt-list-search-color-border`,
        value: `var(--rt-input-color-border)`,
        dark: `var(--rt-input-color-border)`,
    },
    {
        name: `--rt-list-search-color-bg`,
        value: `var(--rt-input-color-bg)`,
        dark: `var(--rt-input-color-bg)`,
    },
    {
        name: `--rt-list-search-width`,
        value: `var(--rt-size-60)`,
    },
    {
        name: `--rt-list-search-padding-x`,
        value: `var(--rt-input-padding-x)`,
    },
    {
        name: `--rt-list-search-gap`,
        value: `var(--rt-input-gap)`,
    },
    {
        name: `--rt-list-search-font-size`,
        value: `var(--rt-input-font-size)`,
    },
    {
        name: `--rt-list-search-icon-size`,
        value: `var(--rt-input-icon-size)`,
    },
    {
        name: `--rt-list-search-icon-color`,
        value: `var(--rt-input-icon-color)`,
        dark: `var(--rt-input-icon-color)`,
    },
    {
        name: `--rt-list-search-color-placeholder`,
        value: `var(--rt-input-color-text-placeholder)`,
        dark: `var(--rt-input-color-text-placeholder)`,
    },
    {
        lead: `    /* Панель настройки колонок списка — заливка плашки колонки и тон значков на ней.
       Свой вид берёт подложку и приглушённый текст; материальный набор отдаёт их теме. */`,
        space: true,
        name: `--rt-list-settings-item-bg`,
        value: `var(--rt-color-bg-subtle)`,
        dark: `var(--rt-color-bg-subtle)`,
    },
    {
        name: `--rt-list-settings-icon-color`,
        value: `var(--rt-color-text-muted)`,
        dark: `var(--rt-color-text-muted)`,
    },
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
    {
        lead: `    /* Скругление контрола — назначение, а не ступень на месте. Кнопка, поле ввода и
       всё, что стоит с ними в строке, берут его отсюда: набор оформления живёт слоем
       назначений и до ступени, взятой компонентом напрямую, не достаёт. */`,
        space: true,
        name: `--rt-radius-control`,
        value: `var(--rt-radius-lg)`,
    },
    {
        lead: `    /* Radius / spacing / border */`,
        space: true,
        name: `--rt-input-radius`,
        value: `var(--rt-radius-control)`,
    },
    {
        name: `--rt-input-padding-x`,
        value: `var(--rt-space-4)`,
    },
    {
        name: `--rt-input-padding-y`,
        value: `var(--rt-space-0)`,
    },
    {
        name: `--rt-input-border-width`,
        value: `var(--rt-border-width-thin)`,
    },
    {
        name: `--rt-input-focus-outline-offset`,
        value: `var(--rt-border-width-thin)`,
    },
    {
        lead: `    /* Typography */`,
        space: true,
        name: `--rt-input-font-size`,
        value: `var(--rt-text-sm)`,
    },
    {
        name: `--rt-input-line-height`,
        value: `var(--rt-leading-none)`,
    },
    {
        lead: `    /* State / motion */`,
        space: true,
        name: `--rt-input-disabled-opacity`,
        value: `var(--rt-opacity-disabled)`,
    },
    {
        name: `--rt-input-focus-shadow`,
        value: `var(--rt-shadow-focus-ring)`,
    },
    {
        name: `--rt-input-focus-shadow-error`,
        value: `var(--rt-shadow-focus-ring-danger)`,
    },
    {
        name: `--rt-input-transition`,
        value: `border-color var(--rt-duration-fast) ease, box-shadow var(--rt-duration-fast) ease`,
    },
    {
        lead: `    /* Textarea overrides (multi-line) */`,
        space: true,
        name: `--rt-textarea-min-height-sm`,
        value: `var(--rt-control-textarea-min-height-sm)`,
    },
    {
        name: `--rt-textarea-min-height-md`,
        value: `var(--rt-control-textarea-min-height-md)`,
    },
    {
        name: `--rt-textarea-min-height-lg`,
        value: `var(--rt-control-textarea-min-height-lg)`,
    },
    {
        name: `--rt-textarea-min-height`,
        value: `var(--rt-textarea-min-height-md)`,
    },
    {
        name: `--rt-textarea-padding-y`,
        value: `var(--rt-space-sm)`,
    },
    {
        name: `--rt-textarea-line-height`,
        value: `var(--rt-leading-snug)`,
    },
    {
        lead: `    /* Dropdown panel (select / multiselect / autocomplete popup). */`,
        space: true,
        name: `--rt-input-panel-max-height`,
        value: `var(--rt-control-panel-max-height)`,
    },
    {
        lead: `    /* Icon-button hover-overlay — отдельный namespace (вне input-family),
       тот же primitive-источник. */`,
        space: true,
        name: `--rt-icon-button-color-bg-hover`,
        value: `var(--rt-overlay-black-4)`,
        dark: `var(--rt-overlay-white-4)`,
    },
    {
        lead: `    /* Counter (rt-counter) и строка вокруг него (rt-counter-row). Значение
       набирается табличными цифрами и держит ширину, иначе кнопки прыгают
       при переходе через десяток. */`,
        space: true,
        name: `--rt-counter-gap`,
        value: `var(--rt-space-sm)`,
    },
    {
        name: `--rt-counter-value-min-width`,
        value: `var(--rt-size-6)`,
    },
    {
        name: `--rt-counter-value-font-size`,
        value: `var(--rt-text-md)`,
    },
    {
        name: `--rt-counter-value-color`,
        value: `var(--rt-color-text-primary)`,
    },
    {
        name: `--rt-counter-row-gap`,
        value: `var(--rt-space-md)`,
    },
    {
        name: `--rt-counter-row-padding-y`,
        value: `var(--rt-space-md)`,
    },
    {
        name: `--rt-counter-row-color-border`,
        value: `var(--rt-color-border-subtle)`,
    },
    {
        name: `--rt-counter-row-label-font-size`,
        value: `var(--rt-text-md)`,
    },
    {
        name: `--rt-counter-row-label-color`,
        value: `var(--rt-color-text-primary)`,
    },
    {
        name: `--rt-counter-row-hint-font-size`,
        value: `var(--rt-text-sm)`,
    },
    {
        name: `--rt-counter-row-hint-color`,
        value: `var(--rt-color-text-muted)`,
    },
    {
        lead: `    /* Toggle-switch (rt-toggle-switch) — трек, бегунок и иконки состояния. */`,
        space: true,
        name: `--rt-toggle-color-track`,
        value: `var(--rt-color-bg-surface-subtle-2)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        name: `--rt-toggle-color-track-on`,
        value: `var(--rt-color-action-primary)`,
        dark: `var(--rt-color-action-primary)`,
    },
    {
        name: `--rt-toggle-color-border`,
        value: `var(--rt-color-border-strong)`,
        dark: `var(--rt-color-border-strong)`,
    },
    {
        name: `--rt-toggle-color-thumb`,
        value: `var(--rt-color-bg-surface)`,
        dark: `var(--rt-neutral-50)`,
    },
    {
        name: `--rt-toggle-color-icon`,
        value: `var(--rt-amber-400)`,
        note: `rt-theme-shared: янтарь иконки один в обеих темах`,
    },
    {
        name: `--rt-toggle-shadow-thumb`,
        value: `var(--rt-shadow-md)`,
        dark: `var(--rt-shadow-none)`,
    },
    {
        lead: `    /* Рамка off-трека — inset-тенью, а не border: у border своя коробка, и
       отступы бегунка с иконками пришлось бы пересчитывать на её толщину. */`,
        space: true,
        name: `--rt-toggle-shadow-border`,
        value: `inset 0 0 0 var(--rt-border-width-thin) var(--rt-toggle-color-border)`,
    },
];
