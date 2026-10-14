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
        value: `var(--mat-sys-on-surface, var(--rt-mat-neutral-100))`,
    },
    { name: `--rt-color-text-muted`, value: `var(--rt-mat-neutral-60)` },
    {
        name: `--rt-color-text-disabled`,
        value: `color-mix(in srgb, var(--mat-sys-on-surface, var(--rt-mat-neutral-100)) 38%, transparent)`,
        dark: `color-mix(in srgb, var(--mat-sys-on-surface, var(--rt-mat-neutral-0)) 38%, transparent)`,
    },
    { name: `--rt-color-text-inverse`, value: `var(--mat-sys-inverse-on-surface, var(--rt-mat-neutral-0))` },
    { name: `--rt-color-text-link`, value: `var(--mat-sys-primary, var(--rt-mat-blue-100))` },
    { name: `--rt-color-text-link-hover`, value: `color-mix(in srgb, var(--mat-sys-primary, var(--rt-mat-blue-100)) 90%, #000)` },

    {
        lead: `    /* Рамки */`,
        space: true,
        name: `--rt-color-border-default`,
        value: `var(--rt-mat-neutral-25)`,
    },
    { name: `--rt-color-border-strong`, value: `var(--rt-mat-neutral-30)` },
    { name: `--rt-color-border-subtle`, value: `var(--rt-mat-neutral-20)`, dark: `var(--rt-mat-dark-20)` },
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
        value: `color-mix(in srgb, var(--mat-sys-on-surface, var(--rt-mat-neutral-100)) 12%, transparent)`,
        dark: `color-mix(in srgb, var(--mat-sys-on-surface, var(--rt-mat-neutral-0)) 12%, transparent)`,
    },

    {
        lead: `    /* Состояния: цвет роли и её светлая подложка */`,
        space: true,
        name: `--rt-color-state-success`,
        value: `var(--rt-mat-green-100)`,
    },
    { name: `--rt-color-state-success-bg`, value: `var(--rt-mat-green-10)` },
    { name: `--rt-color-state-success-text`, value: `var(--rt-mat-green-120)` },
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
    { name: `--rt-list-search-color-bg`, value: `transparent`, dark: `transparent` },
    /* The search field of the first kit's list, measured on its showcase: 22rem wide, the icon of 24px
       12px in from the edge, 16px from the icon to a 16px text, icon and text in the variant tone.
       Without a Material theme on the page the variant tone falls back to `neutral-60`, the step the
       settings icons already take: `neutral-30` gave 1.5:1 on white, and the placeholder and the icons
       of the search and of the table were not read at all. */
    { name: `--rt-list-search-width`, value: `calc(var(--rt-size-64) + var(--rt-size-24))` },
    { name: `--rt-list-search-padding-x`, value: `calc(var(--rt-space-2) + var(--rt-space-1) - var(--rt-border-width-thin))` },
    { name: `--rt-list-search-gap`, value: `var(--rt-space-4)` },
    { name: `--rt-list-search-font-size`, value: `var(--rt-text-md)` },
    { name: `--rt-list-search-icon-size`, value: `var(--rt-size-6)` },
    { name: `--rt-list-search-icon-color`, value: `var(--mat-sys-on-surface-variant, var(--rt-mat-neutral-60))` },
    { name: `--rt-list-search-color-placeholder`, value: `var(--mat-sys-on-surface-variant, var(--rt-mat-neutral-60))` },

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
    { name: `--rt-list-table-icon-color`, value: `var(--mat-sys-on-surface-variant, var(--rt-mat-neutral-60))` },
    { name: `--rt-list-table-head-divider-color`, value: `var(--mat-sys-outline, var(--rt-mat-neutral-30))` },
    { name: `--rt-list-table-button-size`, value: `calc(var(--rt-size-8) + var(--rt-size-1))` },
    { name: `--rt-list-table-button-radius`, value: `var(--rt-radius-full)` },
    { name: `--rt-list-copy-button-size`, value: `var(--rt-size-6)` },
    { name: `--rt-list-copy-button-radius`, value: `var(--rt-mat-radius-5)` },
    { name: `--rt-list-settings-item-radius`, value: `var(--rt-mat-radius-5)` },
    { name: `--rt-list-filter-line-height`, value: `var(--rt-size-6)` },
    { name: `--rt-list-copy-button-bg`, value: `var(--mat-fab-small-container-color, var(--rt-mat-neutral-0))` },
    { name: `--rt-list-copy-button-bg-hover`, value: `var(--mat-fab-small-container-color, var(--rt-mat-neutral-0))` },
    { name: `--rt-list-copy-button-color`, value: `var(--rt-mat-neutral-60)` },
    { name: `--rt-list-action-color-hover`, value: `var(--rt-mat-neutral-100)` },
    { name: `--rt-list-action-color-bg-hover`, value: `transparent` },
    { name: `--rt-list-toolbar-padding-top`, value: `var(--rt-space-4)` },
    { name: `--rt-list-toolbar-padding-bottom`, value: `0px` },
    { name: `--rt-list-toolbar-gap`, value: `var(--rt-space-4)` },
    { name: `--rt-list-empty-icon-wrap-size`, value: `var(--rt-size-12)` },
    { name: `--rt-list-empty-icon-wrap-bg`, value: `transparent` },
    { name: `--rt-list-empty-icon-size`, value: `var(--rt-size-12)` },
    { name: `--rt-list-empty-title-size`, value: `var(--rt-text-3xl)` },
    { name: `--rt-list-empty-title-weight`, value: `var(--rt-font-weight-regular)` },
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
    { name: `--rt-pagination-padding-y`, value: `var(--rt-space-sm)` },
    { name: `--rt-pagination-padding-x`, value: `0px` },
    { name: `--rt-pagination-nav-gap`, value: `var(--rt-space-sm)` },
    { name: `--rt-pagination-range-display`, value: `none` },
    { name: `--rt-pagination-box-size`, value: `calc(var(--rt-space-xl) + 2 * var(--rt-border-width-thin))` },
    { name: `--rt-pagination-box-radius`, value: `calc(var(--rt-radius-lg) + var(--rt-radius-xs))` },
    { name: `--rt-pagination-box-color-border`, value: `var(--rt-mat-neutral-30)`, dark: `var(--rt-mat-dark-30)` },
    { name: `--rt-pagination-box-color-text`, value: `var(--rt-mat-neutral-60)`, dark: `var(--rt-mat-neutral-40)` },
    { name: `--rt-pagination-box-current-color-bg`, value: `var(--rt-mat-neutral-60)`, dark: `var(--rt-mat-neutral-40)` },
    { name: `--rt-pagination-box-current-color-text`, value: `var(--rt-mat-neutral-0)`, dark: `var(--rt-mat-neutral-0)` },
    { name: `--rt-pagination-box-current-color-border`, value: `var(--rt-mat-neutral-30)`, dark: `var(--rt-mat-dark-30)` },
    { name: `--rt-pagination-box-current-font-weight`, value: `var(--rt-font-weight-regular)` },
    { name: `--rt-pagination-arrow-size`, value: `calc(var(--rt-space-xl) + 2 * var(--rt-border-width-thin))` },
    { name: `--rt-pagination-arrow-radius`, value: `calc(var(--rt-radius-lg) + var(--rt-radius-xs))` },
    {
        name: `--rt-pagination-arrow-shadow`,
        value: `inset 0 0 0 var(--rt-border-width-thin) var(--rt-mat-neutral-30)`,
        dark: `inset 0 0 0 var(--rt-border-width-thin) var(--rt-mat-dark-30)`,
    },
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

    {
        lead: `    /* Панели над страницей — скругления и подъём первого кита: меню 4px, выпадающий список
       скруглён только снизу, подсказка 4px без тени. Тень — подъём 2 Material, как у mat-menu и
       mat-select. */`,
        space: true,
        name: `--rt-overlay-menu-radius`,
        value: `var(--rt-mat-radius-4)`,
    },
    { name: `--rt-overlay-menu-shadow`, value: `var(--mat-sys-level2, var(--rt-mat-shadow-level-2))` },
    { name: `--rt-overlay-select-radius`, value: `0 0 var(--rt-mat-radius-4) var(--rt-mat-radius-4)` },
    { name: `--rt-overlay-select-shadow`, value: `var(--mat-sys-level2, var(--rt-mat-shadow-level-2))` },
    { name: `--rt-overlay-tooltip-radius`, value: `var(--rt-mat-radius-4)` },
    { name: `--rt-overlay-tooltip-shadow`, value: `none` },
    {
        lead: `    /* Меню строки — mat-menu первого кита: фон контейнера Material, отступ 8px сверху и снизу,
       подписи весом 500, опасный пункт красным первого кита. Выпадающий список — mat-select: пункты
       16px, выбранный — фон текста 12% без жирного и с галочкой. */`,
        space: true,
        name: `--rt-overlay-menu-bg`,
        value: `var(--mat-menu-container-color, var(--rt-mat-neutral-0))`,
        dark: `var(--mat-menu-container-color, var(--rt-color-bg-surface))`,
    },
    { name: `--rt-overlay-menu-padding-y`, value: `var(--rt-space-sm)` },
    { name: `--rt-overlay-menu-item-weight`, value: `var(--rt-font-weight-medium)` },
    { name: `--rt-overlay-menu-danger-color`, value: `var(--rt-mat-red-100)` },
    { name: `--rt-overlay-select-option-font-size`, value: `var(--rt-text-md)` },
    {
        name: `--rt-overlay-select-selected-bg`,
        value: `color-mix(in srgb, var(--mat-sys-on-surface, var(--rt-mat-neutral-100)) 12%, transparent)`,
        dark: `color-mix(in srgb, var(--mat-sys-on-surface, var(--rt-mat-neutral-0)) 12%, transparent)`,
    },
    { name: `--rt-overlay-select-selected-weight`, value: `var(--rt-font-weight-regular)` },
    { name: `--rt-overlay-select-check-display`, value: `inline-flex` },
    {
        name: `--rt-overlay-menu-current-bg`,
        value: `color-mix(in srgb, var(--mat-sys-on-surface, var(--rt-mat-neutral-100)) 12%, transparent)`,
        dark: `color-mix(in srgb, var(--mat-sys-on-surface, var(--rt-mat-neutral-0)) 12%, transparent)`,
    },
    { name: `--rt-overlay-menu-min-width`, value: `var(--rt-mat-menu-min-width)` },
    { name: `--rt-overlay-menu-item-min-height`, value: `var(--rt-size-12)` },
    { name: `--rt-overlay-menu-item-padding-y`, value: `0px` },
    { name: `--rt-overlay-menu-item-padding-x`, value: `var(--rt-size-3)` },
    { name: `--rt-overlay-menu-item-icon-size`, value: `var(--rt-size-6)` },
    { name: `--rt-overlay-menu-sm-item-min-height`, value: `var(--rt-mat-menu-sm-item-height)` },
    { name: `--rt-overlay-menu-sm-item-icon-size`, value: `var(--rt-mat-menu-sm-icon-size)` },
    { name: `--rt-overlay-menu-danger-label-color`, value: `var(--rt-color-text-primary)` },
    { name: `--rt-overlay-select-option-min-height`, value: `var(--rt-size-12)` },
    { name: `--rt-overlay-select-panel-border-width`, value: `0px` },
    { name: `--rt-icon-button-disabled-opacity`, value: `1` },
    { name: `--rt-icon-button-disabled-color`, value: `var(--rt-color-text-disabled)` },
    { name: `--rt-icon-button-disabled-fill`, value: `0%` },
    {
        lead: `    /* Обведённое поле Material: прозрачное, рамка цвета outline темы, фокус — рамка в два
       пикселя цветом марки без внешнего кольца. Вторая линия рамки фокуса — внутренняя тень. */`,
        space: true,
        name: `--rt-input-color-bg`,
        value: `transparent`,
    },
    { name: `--rt-input-color-border`, value: `var(--mat-sys-outline, var(--rt-mat-neutral-60))` },
    { name: `--rt-input-focus-shadow`, value: `inset 0 0 0 1px var(--rt-input-color-border-focus)` },
    { name: `--rt-input-focus-shadow-error`, value: `inset 0 0 0 1px var(--rt-input-color-border-error)` },
    {
        lead: `    /* Размер поля Material: 56 px при плотности 0 и на 4 px меньше за каждый шаг, значение 16 px.
       Шаг приходит свойством \`--rt-input-density\`, которое ставит атрибут \`data-rt-density\` на поле
       или на любом предке, — правила в \`_density.scss\`. Высота считается здесь, на узле с признаком
       набора, из унаследованного шага: атрибут на корне приложения доходит и до поля со своим
       признаком набора. Своя высота приложения — \`--rt-input-height-app\` на любом предке; она сильнее
       плотности и не перебивается набором на самом поле. */`,
        space: true,
        name: `--rt-input-height-md`,
        value: `var(--rt-input-height-app, calc(var(--rt-size-12) + var(--rt-size-2) - var(--rt-input-density) * var(--rt-size-1)))`,
    },
    { name: `--rt-input-height`, value: `var(--rt-input-height-md)` },
    {
        lead: `    /* Крупная ступень \`size\` не ниже средней высоты набора: 48 px кита под набором вышли бы ниже
       поля по умолчанию (56 px). Малая ступень остаётся ступенью кита — по ней стоят поиск списка и
       правка на месте. */`,
        space: true,
        name: `--rt-input-height-lg`,
        value: `max(var(--rt-control-height-lg), var(--rt-input-height-md))`,
    },
    { name: `--rt-input-font-size`, value: `var(--rt-text-md)` },
    {
        lead: `    /* Подсказка, подпись в покое, значки и стрелка поля — цвета on-surface-variant темы Material,
       каретка — цвета марки, значки 24 px, как у поля Material. Без темы Material цвета прежние. */`,
        space: true,
        name: `--rt-input-color-text-placeholder`,
        value: `var(--mat-sys-on-surface-variant, var(--rt-mat-neutral-60))`,
    },
    {
        name: `--rt-input-icon-color`,
        value: `var(--mat-sys-on-surface-variant, var(--rt-neutral-600))`,
        dark: `var(--mat-sys-on-surface-variant, var(--rt-neutral-600))`,
    },
    { name: `--rt-input-icon-size`, value: `var(--rt-size-6)` },
    { name: `--rt-input-caret-color`, value: `var(--rt-color-action-primary)` },
    {
        lead: `    /* Отключённое поле Material: поле не тускнеет целиком — рамка on-surface 12%, текст и
       подсказка on-surface 38%. */`,
        space: true,
        name: `--rt-input-disabled-field-opacity`,
        value: `1`,
    },
    { name: `--rt-input-color-border-disabled`, value: `var(--rt-color-action-disabled)` },
    { name: `--rt-input-color-text-disabled`, value: `var(--rt-color-text-disabled)` },
    { name: `--rt-input-color-placeholder-disabled`, value: `var(--rt-color-text-disabled)` },
    { name: `--rt-input-color-bg-disabled`, value: `transparent` },
    {
        lead: `    /* Залитое поле Material: рамки сверху и по бокам нет, только черта снизу; в фокусе черта
       вдвое толще цветом марки, у недействительного поля — цветом ошибки. */`,
        space: true,
        name: `--rt-input-fill-edge`,
        value: `0px`,
    },
    { name: `--rt-input-fill-focus-shadow`, value: `inset 0 -1px 0 0 var(--rt-input-color-border-focus)` },
    { name: `--rt-input-fill-focus-shadow-error`, value: `inset 0 -1px 0 0 var(--rt-input-color-border-error)` },
    {
        lead: `    /* Звёздочка обязательного поля — цвета подписи, как у поля Material; цвет ошибки она берёт
       только у недействительного поля, правилом самого поля. */`,
        space: true,
        name: `--rt-field-required-color`,
        value: `currentcolor`,
    },
    { name: `--rt-field-required-gap`, value: `0px` },
];
