/* Материальный набор: назначения, которыми кит рисуется видом первого кита.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`.

   Здесь стоят только переопределения: имя, которого тут нет, приходит из базового набора. Имени,
   которого нет и в базовом наборе, здесь быть не может — генератор роняет сборку.

   Обратную сторону — цветовое имя базового набора, о котором здесь молчат, — держит
   `tools/check-preset-complete.mjs`. Молчание она принимает от имени, которое следует за набором
   через ссылку, и это выводит сама; остальным нужна причина в поле `presetShared` рядом с именем
   в базовом наборе.

   Марка, ошибка, подложка, обратная подложка и заливка поля читают тему Material, если она есть
   на странице, — те же системные имена, что у первого кита: `var(--mat-sys-primary, <ступень>)`.
   Запасным стоит ступень шкалы, и страница без темы Material получает прежний вид; зависимости от
   Material у кита нет — неизвестное свойство браузер заменяет запасным значением. Имена стоят в
   назначениях, а не в шкале: назначения объявляются на узле с признаком набора, и тема Material,
   объявленная на контейнере, доходит до них; ступень шкалы вычислена на корне и её не видит.
   Наведение и нажатие считаются от того же имени, что и цвет покоя, — иначе перекрашенная марка
   темнела бы под курсором к старому синему. Заливка
   поля сперва спрашивает свойство залитого поля Material — им первый кит красит шапку таблицы, и
   его объявляет и тема, собранная без системных имён.

   Значения выбираются из ступеней материальной шкалы (`tokens.scale-material.mjs`), а не
   пишутся кодами цвета: ступень правится в одном месте, а назначение говорит роль. */

export const material = [
    {
        lead: `    /* Подложки */`,
        name: `--rt-color-bg-page`,
        value: `var(--rt-mat-neutral-5)`,
    },
    { name: `--rt-color-bg-surface`, value: `var(--mat-sys-surface, var(--rt-mat-neutral-0))` },
    { name: `--rt-color-bg-surface-subtle`, value: `var(--rt-mat-overlay-black-4)` },
    {
        name: `--rt-color-bg-surface-subtle-2`,
        value: `var(--mat-form-field-filled-container-color, var(--mat-sys-surface-variant, var(--rt-mat-neutral-15)))`,
    },
    { name: `--rt-color-bg-hover`, value: `var(--rt-mat-neutral-10)` },
    { name: `--rt-color-bg-subtle`, value: `var(--rt-mat-neutral-10)` },
    { name: `--rt-color-bg-overlay`, value: `var(--rt-mat-overlay-black-32)` },
    { name: `--rt-color-bg-inverse`, value: `var(--mat-sys-inverse-surface, var(--rt-mat-neutral-100))` },
    {
        name: `--rt-color-bg-nav`,
        value: `var(--mat-sys-primary, var(--rt-mat-navy-100))`,
        note: `марка первого кита: обвязка тёмная в обоих наборах`,
    },
    { name: `--rt-color-bg-page-auth`, value: `var(--rt-mat-neutral-5)` },
    { name: `--rt-color-bg-surface-auth-card`, value: `var(--rt-mat-neutral-0)` },

    {
        lead: `    /* Текст */`,
        space: true,
        name: `--rt-color-text-primary`,
        value: `var(--rt-mat-neutral-100)`,
    },
    { name: `--rt-color-text-muted`, value: `var(--rt-mat-neutral-60)` },
    { name: `--rt-color-text-disabled`, value: `var(--rt-mat-neutral-40)` },
    { name: `--rt-color-text-inverse`, value: `var(--rt-mat-neutral-0)` },
    { name: `--rt-color-text-link`, value: `var(--mat-sys-primary, var(--rt-mat-blue-100))` },
    { name: `--rt-color-text-link-hover`, value: `color-mix(in srgb, var(--mat-sys-primary, var(--rt-mat-blue-100)) 90%, #000)` },

    {
        lead: `    /* Рамки */`,
        space: true,
        name: `--rt-color-border-default`,
        value: `var(--rt-mat-neutral-25)`,
    },
    { name: `--rt-color-border-strong`, value: `var(--rt-mat-neutral-30)` },
    { name: `--rt-color-border-subtle`, value: `var(--rt-mat-neutral-20)` },
    {
        name: `--rt-color-border-focus`,
        value: `var(--rt-mat-blue-40)`,
        note: `кольцо фокуса первого кита светлее его действия`,
    },

    {
        lead: `    /* Действие: подложка, наведение, нажатие, подпись на них и цвет роли на поверхности */`,
        space: true,
        name: `--rt-color-action-primary`,
        value: `var(--mat-sys-primary, var(--rt-mat-blue-100))`,
    },
    { name: `--rt-color-action-primary-hover`, value: `color-mix(in srgb, var(--mat-sys-primary, var(--rt-mat-blue-100)) 90%, #000)` },
    { name: `--rt-color-action-primary-active`, value: `color-mix(in srgb, var(--mat-sys-primary, var(--rt-mat-blue-100)) 80%, #000)` },
    {
        name: `--rt-color-action-primary-subtle`,
        value: `color-mix(in srgb, var(--mat-sys-primary, var(--rt-mat-blue-100)) 8%, transparent)`,
    },
    {
        name: `--rt-color-action-primary-soft`,
        value: `color-mix(in srgb, var(--mat-sys-primary, var(--rt-mat-blue-100)) 24%, transparent)`,
    },
    { name: `--rt-color-action-on-primary`, value: `var(--rt-mat-neutral-0)` },

    {
        name: `--rt-color-action-secondary`,
        value: `var(--rt-mat-neutral-60)`,
    },
    { name: `--rt-color-action-secondary-hover`, value: `var(--rt-mat-neutral-hover)` },
    { name: `--rt-color-action-secondary-active`, value: `var(--rt-mat-neutral-active)` },
    { name: `--rt-color-action-on-secondary`, value: `var(--rt-mat-neutral-0)` },
    { name: `--rt-color-action-secondary-on-surface`, value: `var(--rt-mat-neutral-60)` },

    {
        name: `--rt-color-action-success`,
        value: `var(--rt-mat-green-80)`,
    },
    { name: `--rt-color-action-success-hover`, value: `var(--rt-mat-green-hover)` },
    { name: `--rt-color-action-success-active`, value: `var(--rt-mat-green-active)` },
    { name: `--rt-color-action-on-success`, value: `var(--rt-mat-neutral-0)` },

    {
        name: `--rt-color-action-warning`,
        value: `var(--rt-mat-orange-80)`,
    },
    { name: `--rt-color-action-warning-hover`, value: `var(--rt-mat-orange-hover)` },
    { name: `--rt-color-action-warning-active`, value: `var(--rt-mat-orange-active)` },
    { name: `--rt-color-action-on-warning`, value: `var(--rt-mat-neutral-0)` },

    {
        name: `--rt-color-action-danger`,
        value: `var(--mat-sys-error, var(--rt-mat-red-100))`,
    },
    { name: `--rt-color-action-danger-hover`, value: `color-mix(in srgb, var(--mat-sys-error, var(--rt-mat-red-100)) 90%, #000)` },
    { name: `--rt-color-action-danger-active`, value: `color-mix(in srgb, var(--mat-sys-error, var(--rt-mat-red-100)) 80%, #000)` },
    { name: `--rt-color-action-on-danger`, value: `var(--rt-mat-neutral-0)` },

    {
        name: `--rt-color-action-info`,
        value: `var(--mat-sys-primary, var(--rt-mat-blue-100))`,
    },
    { name: `--rt-color-action-info-hover`, value: `color-mix(in srgb, var(--mat-sys-primary, var(--rt-mat-blue-100)) 90%, #000)` },
    { name: `--rt-color-action-info-active`, value: `color-mix(in srgb, var(--mat-sys-primary, var(--rt-mat-blue-100)) 80%, #000)` },
    { name: `--rt-color-action-on-info`, value: `var(--rt-mat-neutral-0)` },

    {
        name: `--rt-color-action-disabled`,
        value: `var(--rt-mat-neutral-25)`,
    },

    {
        lead: `    /* Состояния: цвет роли и её светлая подложка */`,
        space: true,
        name: `--rt-color-state-success`,
        value: `var(--rt-mat-green-100)`,
    },
    { name: `--rt-color-state-success-bg`, value: `var(--rt-mat-green-10)` },
    { name: `--rt-color-state-warning`, value: `var(--rt-mat-orange-100)` },
    { name: `--rt-color-state-warning-bg`, value: `var(--rt-mat-orange-5)` },
    { name: `--rt-color-state-warning-text`, value: `var(--rt-mat-orange-100)` },
    { name: `--rt-color-state-danger`, value: `var(--mat-sys-error, var(--rt-mat-red-100))` },
    { name: `--rt-color-state-danger-bg`, value: `var(--mat-sys-error-container, var(--rt-mat-red-10))` },
    { name: `--rt-color-state-error-text`, value: `var(--mat-sys-error, var(--rt-mat-red-100))` },
    { name: `--rt-color-state-info`, value: `var(--mat-sys-primary, var(--rt-mat-blue-100))` },
    { name: `--rt-color-state-info-bg`, value: `var(--mat-sys-primary-container, var(--rt-mat-blue-20))` },

    {
        lead: `    /* Рельса шагов */`,
        space: true,
        name: `--rt-color-stepper-track`,
        value: `var(--rt-mat-neutral-30)`,
    },
    {
        lead: `    /* Заглушка загрузки: краски те же, что набор давал ей прежде через подложку и
       рамку, — вид под набором от разведения концов не поехал. */`,
        space: true,
        name: `--rt-color-skeleton-base`,
        value: `var(--rt-mat-neutral-10)`,
    },
    { name: `--rt-color-skeleton-wave`, value: `var(--rt-mat-neutral-25)` },

    {
        lead: `    /* Шапка таблицы первого кита залита тем же цветом, что залитое поле Material. */`,
        space: true,
        name: `--rt-color-table-head-bg`,
        value: `var(--mat-form-field-filled-container-color, var(--mat-sys-surface-variant, var(--rt-mat-overlay-black-4)))`,
    },

    {
        lead: `    /* Черта снизу у залитого поля Material — цвет on-surface-variant темы. */`,
        space: true,
        name: `--rt-color-field-fill-underline`,
        value: `var(--mat-sys-on-surface-variant, var(--rt-mat-neutral-30))`,
    },

    {
        lead: `    /* Поиск списка первого кита — обведённое или залитое поле Material при плотности −1:
       52px, скругление 4px, рамка цвета outline темы, внутри прозрачное. Ступени 52px нет, высота собрана из ступени
       xl без ступени 1. */`,
        space: true,
        name: `--rt-list-search-height`,
        value: `calc(var(--rt-control-height-xl) - var(--rt-space-1))`,
    },
    { name: `--rt-list-search-radius`, value: `var(--rt-radius-sm)` },
    { name: `--rt-list-search-color-border`, value: `var(--mat-sys-outline, var(--rt-mat-neutral-25))` },
    { name: `--rt-list-search-color-bg`, value: `transparent` },
    /* The search field of the first kit's list, measured on its showcase: 22rem wide, the icon of 24px
       12px in from the edge, 16px from the icon to a 16px text, icon and text in the variant tone. */
    { name: `--rt-list-search-width`, value: `calc(var(--rt-size-64) + var(--rt-size-24))` },
    { name: `--rt-list-search-padding-x`, value: `calc(var(--rt-space-2) + var(--rt-space-1) - var(--rt-border-width-thin))` },
    { name: `--rt-list-search-gap`, value: `var(--rt-space-4)` },
    { name: `--rt-list-search-font-size`, value: `var(--rt-text-md)` },
    { name: `--rt-list-search-icon-size`, value: `var(--rt-size-6)` },
    { name: `--rt-list-search-icon-color`, value: `var(--mat-sys-on-surface-variant, var(--rt-mat-neutral-30))` },
    { name: `--rt-list-search-color-placeholder`, value: `var(--mat-sys-on-surface-variant, var(--rt-mat-neutral-30))` },

    {
        lead: `    /* Панель настройки колонок первого кита: плашка колонки залита цветом выбранного пункта
       Material, значки — в тоне on-surface-variant темы. Сняты с панели на витрине первого кита. */`,
        space: true,
        name: `--rt-list-settings-item-bg`,
        value: `var(--mat-option-selected-state-layer-color, var(--mat-sys-secondary-container, var(--rt-mat-neutral-10)))`,
    },
    { name: `--rt-list-settings-icon-color`, value: `var(--mat-sys-on-surface-variant, var(--rt-mat-neutral-60))` },

    {
        lead: `    /* Кнопки действий панели списка — mat-mini-fab первого кита: круг без заливки с подъёмом 6,
       под указателем подъём 8 и тёмный значок вместо серого; значок 24px, промежуток 16px. */`,
        space: true,
        name: `--rt-list-action-gap`,
        value: `var(--rt-space-md)`,
    },
    { name: `--rt-list-action-divider-height`, value: `var(--rt-size-8)` },
    { name: `--rt-list-action-radius`, value: `var(--rt-radius-full)` },
    { name: `--rt-list-action-shadow`, value: `var(--rt-mat-shadow-fab)` },
    { name: `--rt-list-action-shadow-hover`, value: `var(--rt-mat-shadow-fab-hover)` },
    { name: `--rt-list-action-icon-size`, value: `var(--rt-size-6)` },
    { name: `--rt-list-action-color`, value: `var(--rt-mat-neutral-60)` },
    { name: `--rt-list-table-icon-size`, value: `var(--rt-size-6)` },
    { name: `--rt-list-table-icon-color`, value: `var(--mat-sys-on-surface-variant, var(--rt-mat-neutral-30))` },
    { name: `--rt-list-table-button-size`, value: `calc(var(--rt-size-8) + var(--rt-size-1))` },
    { name: `--rt-list-table-button-radius`, value: `var(--rt-radius-full)` },
    { name: `--rt-list-filter-field-height`, value: `var(--rt-list-search-height)` },
    { name: `--rt-list-filter-field-font-size`, value: `var(--rt-list-search-font-size)` },
    { name: `--rt-list-filter-field-color-border`, value: `var(--rt-list-search-color-border)` },
    { name: `--rt-list-filter-field-color-bg`, value: `var(--rt-list-search-color-bg)` },
    { name: `--rt-list-filter-field-color-placeholder`, value: `var(--rt-list-search-color-placeholder)` },
    { name: `--rt-list-copy-button-size`, value: `var(--rt-size-6)` },
    { name: `--rt-list-copy-button-radius`, value: `calc((var(--rt-radius-sm) + var(--rt-radius-ms)) / 2)` },
    { name: `--rt-list-copy-button-bg`, value: `var(--mat-sys-primary-container, var(--rt-mat-blue-20))` },
    { name: `--rt-list-copy-button-bg-hover`, value: `var(--mat-sys-primary-container, var(--rt-mat-blue-20))` },
    { name: `--rt-list-copy-button-color`, value: `var(--rt-mat-neutral-60)` },
    { name: `--rt-list-copy-button-color-hover`, value: `var(--rt-mat-neutral-100)` },
    { name: `--rt-list-action-color-hover`, value: `var(--rt-mat-neutral-100)` },
    { name: `--rt-list-action-color-bg-hover`, value: `transparent` },
    { name: `--rt-list-selector-label-color`, value: `var(--rt-mat-neutral-60)` },

    {
        lead: `    /* Полоса страниц первого кита: ячейки 34px в серой рамке со скруглением 12px, промежуток 8px,
       текущая залита серым с белой цифрой, стрелки такими же ячейками. Подписи диапазона нет,
       номера и выбор размера стоят рядом через 32px, поле размера 32px высотой. */`,
        space: true,
        name: `--rt-pagination-justify`,
        value: `flex-start`,
    },
    { name: `--rt-pagination-gap`, value: `var(--rt-space-xl)` },
    { name: `--rt-pagination-nav-gap`, value: `var(--rt-space-sm)` },
    { name: `--rt-pagination-range-display`, value: `none` },
    { name: `--rt-pagination-box-size`, value: `calc(var(--rt-space-xl) + 2 * var(--rt-border-width-thin))` },
    { name: `--rt-pagination-box-radius`, value: `calc(var(--rt-radius-lg) + var(--rt-radius-xs))` },
    { name: `--rt-pagination-box-color-border`, value: `var(--rt-mat-neutral-30)` },
    { name: `--rt-pagination-box-color-text`, value: `var(--rt-mat-neutral-60)` },
    { name: `--rt-pagination-box-current-color-bg`, value: `var(--rt-mat-neutral-60)` },
    { name: `--rt-pagination-box-current-color-text`, value: `var(--rt-mat-neutral-0)` },
    { name: `--rt-pagination-box-current-color-border`, value: `var(--rt-mat-neutral-30)` },
    { name: `--rt-pagination-box-current-font-weight`, value: `var(--rt-font-weight-regular)` },
    { name: `--rt-pagination-arrow-size`, value: `calc(var(--rt-space-xl) + 2 * var(--rt-border-width-thin))` },
    { name: `--rt-pagination-arrow-radius`, value: `calc(var(--rt-radius-lg) + var(--rt-radius-xs))` },
    { name: `--rt-pagination-arrow-shadow`, value: `inset 0 0 0 var(--rt-border-width-thin) var(--rt-mat-neutral-30)` },
    { name: `--rt-pagination-arrow-color`, value: `var(--rt-mat-neutral-60)` },
    { name: `--rt-pagination-per-page-gap`, value: `calc(var(--rt-space-sm) + var(--rt-space-xs))` },
    { name: `--rt-pagination-per-page-label-white-space`, value: `nowrap` },
    { name: `--rt-pagination-field-height`, value: `var(--rt-control-height-sm)` },
    { name: `--rt-pagination-field-radius`, value: `calc(var(--rt-radius-lg) + var(--rt-radius-xs))` },
    { name: `--rt-pagination-field-color-border`, value: `var(--rt-mat-neutral-30)` },
    { name: `--rt-pagination-field-padding-x`, value: `var(--rt-space-sm)` },
    { name: `--rt-pagination-field-color-bg`, value: `transparent` },
    { name: `--rt-pagination-field-color-text`, value: `var(--rt-mat-neutral-60)` },

    {
        lead: `    /* Переключатель первого кита — свой, не Material: серый трек в рамке, включённый — в цвете
       действия темы, как у кнопки. Тёмная тема отвечает на эти имена своими цветами. */`,
        space: true,
        name: `--rt-toggle-color-track`,
        value: `var(--rt-mat-neutral-20)`,
    },
    { name: `--rt-toggle-color-track-on`, value: `var(--rt-color-action-primary)` },
    { name: `--rt-toggle-color-border`, value: `var(--rt-mat-neutral-30)` },

    {
        lead: `    /* Кнопка и поле первого кита скруглены заметно сильнее: 1.5rem против 10px.
       Значение снято числом — ссылки на токены первого кита во второй кит не едут. */`,
        space: true,
        name: `--rt-radius-control`,
        value: `1.5rem`,
    },
];
