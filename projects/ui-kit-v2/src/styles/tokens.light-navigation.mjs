/* Назначения светлой темы: навигация. Шапка страницы, оба уровня меню, попап профиля и
   маркер непросмотренного.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`. */

export const lightNavigation = [
    {
        lead: `    /* Навигация (rt-page-header). Шапка — отдельная плашка; отступ от краёв
       страницы задаёт тот, кто её ставит. */`,
        space: true,
        name: `--rt-nav-header-padding`,
        value: `var(--rt-space-2) var(--rt-space-4)`,
    },
    {
        name: `--rt-nav-header-color-bg`,
        value: `var(--rt-neutral-50)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        lead: `    /* Первый уровень. Пункт ряда несёт плашку цвета самой шапки: на общем фоне её
       не видно, и белым проступает только активный раздел. Наведение красит
       подпись, а не фон — иначе оно спорит с этой подсветкой. */`,
        space: true,
        name: `--rt-nav-item-height`,
        value: `var(--rt-size-6)`,
    },
    {
        name: `--rt-nav-item-gap`,
        value: `var(--rt-space-1)`,
    },
    {
        name: `--rt-nav-item-padding`,
        value: `var(--rt-space-2) var(--rt-space-2)`,
    },
    {
        name: `--rt-nav-item-content-gap`,
        value: `var(--rt-space-2)`,
    },
    {
        name: `--rt-nav-item-font-size`,
        value: `var(--rt-text-sm)`,
    },
    {
        name: `--rt-nav-item-font-weight`,
        value: `var(--rt-font-weight-semibold)`,
    },
    {
        name: `--rt-nav-item-line-height`,
        value: `var(--rt-leading-none)`,
    },
    {
        name: `--rt-nav-item-color`,
        value: `var(--rt-color-text-primary)`,
    },
    {
        name: `--rt-nav-item-color-hover`,
        value: `var(--rt-color-action-primary)`,
    },
    {
        name: `--rt-nav-item-color-pressed`,
        value: `var(--rt-color-action-primary-hover)`,
    },
    {
        name: `--rt-nav-item-color-bg`,
        value: `var(--rt-neutral-50)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        name: `--rt-nav-item-color-border`,
        value: `var(--rt-neutral-50)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        name: `--rt-nav-item-color-bg-active`,
        value: `var(--rt-color-bg-surface)`,
        dark: `var(--rt-charcoal-800)`,
    },
    {
        name: `--rt-nav-item-color-caret`,
        value: `var(--rt-neutral-200)`,
        dark: `var(--rt-neutral-600)`,
    },
    {
        lead: `    /* Фокус обведён пунктиром: сплошная рамка на плашке пункта неотличима от его
       же границы. */`,
        space: true,
        name: `--rt-nav-color-focus`,
        value: `var(--rt-color-action-primary)`,
    },
    {
        lead: `    /* Недоступный пункт светлее доступного, а не другого оттенка: общий
       \`text-disabled\` уходит в сине-стальной и рядом с серой подписью читается
       как второй цвет, а не как выключенное состояние. */`,
        space: true,
        name: `--rt-nav-color-disabled`,
        value: `var(--rt-neutral-300)`,
        dark: `var(--rt-neutral-600)`,
    },
    {
        lead: `    /* Попап профиля. Подложку берёт у панели навигации, своего здесь — габариты
       блока пользователя, тень и набор строк: строк четыре, и они читаются как
       список действий, а не как выпадающее меню. */`,
        space: true,
        name: `--rt-profile-menu-min-width`,
        value: `var(--rt-size-60)`,
    },
    {
        name: `--rt-profile-menu-padding`,
        value: `var(--rt-space-5)`,
    },
    {
        name: `--rt-profile-menu-shadow`,
        value: `var(--rt-shadow-profile-menu)`,
    },
    {
        name: `--rt-profile-avatar-size`,
        value: `var(--rt-size-10)`,
    },
    {
        name: `--rt-profile-avatar-font-size`,
        value: `var(--rt-text-2xl)`,
    },
    {
        name: `--rt-profile-item-padding-y`,
        value: `var(--rt-space-4)`,
    },
    {
        name: `--rt-profile-item-content-gap`,
        value: `var(--rt-space-2)`,
    },
    {
        name: `--rt-profile-item-font-size`,
        value: `var(--rt-text-md)`,
    },
    {
        name: `--rt-profile-item-font-weight`,
        value: `var(--rt-font-weight-medium)`,
    },
    {
        name: `--rt-profile-item-radius`,
        value: `var(--rt-radius-md)`,
    },
    {
        lead: `    /* Строки выступают за содержимое панели на половину её отступа: так
       подсветка на наведении не упирается в рамку, а иконка остаётся на одной
       вертикали с содержимым. Это же число — горизонтальный отступ строки. */`,
        space: true,
        name: `--rt-profile-row-inset`,
        value: `var(--rt-space-2)`,
    },
    {
        name: `--rt-profile-theme-icon-padding`,
        value: `var(--rt-space-2)`,
    },
    {
        lead: `    /* Габариты панели второго уровня: ширина считается числом колонок, поэтому
       колонка, промежуток и внутренний отступ — токены, из которых панель
       складывает свою ширину. По вертикали отступ крупнее: у первой группы над
       заголовком нет ничего, и панель иначе начинается впритык. */`,
        space: true,
        name: `--rt-nav-panel-column-width`,
        value: `var(--rt-size-60)`,
    },
    {
        name: `--rt-nav-panel-column-gap`,
        value: `var(--rt-space-5)`,
    },
    {
        name: `--rt-nav-panel-padding`,
        value: `var(--rt-space-4)`,
    },
    {
        name: `--rt-nav-panel-padding-y`,
        value: `var(--rt-space-md)`,
    },
    {
        name: `--rt-nav-panel-group-gap`,
        value: `var(--rt-space-8)`,
    },
    {
        name: `--rt-nav-panel-item-gap`,
        value: `var(--rt-space-0-5)`,
    },
    {
        name: `--rt-nav-panel-item-height`,
        value: `var(--rt-size-6)`,
    },
    {
        name: `--rt-nav-panel-item-padding`,
        value: `var(--rt-space-1) var(--rt-space-2)`,
    },
    {
        name: `--rt-nav-panel-columns`,
        value: `1`,
    },
    {
        name: `--rt-nav-panel-color-bg`,
        value: `var(--rt-color-bg-surface)`,
        dark: `var(--rt-charcoal-800)`,
    },
    {
        name: `--rt-nav-panel-color-border`,
        value: `var(--rt-neutral-200)`,
        dark: `var(--rt-neutral-600)`,
    },
    {
        name: `--rt-nav-panel-shadow`,
        value: `var(--rt-shadow-nav-panel)`,
    },
    {
        lead: `    /* Второй уровень набран легче первого: ряд разделов держит вес, а полтора
       десятка пунктов под ним читаются построчно. */`,
        space: true,
        name: `--rt-nav-panel-item-font-size`,
        value: `var(--rt-text-sm)`,
    },
    {
        name: `--rt-nav-panel-item-font-weight`,
        value: `var(--rt-font-weight-medium)`,
    },
    {
        name: `--rt-nav-panel-item-content-gap`,
        value: `var(--rt-space-1)`,
    },
    {
        name: `--rt-nav-panel-item-color`,
        value: `var(--rt-neutral-600)`,
        dark: `var(--rt-neutral-200)`,
    },
    {
        name: `--rt-nav-panel-item-color-bg-hover`,
        value: `var(--rt-neutral-50)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        name: `--rt-nav-panel-item-color-active`,
        value: `var(--rt-color-text-inverse)`,
    },
    {
        name: `--rt-nav-panel-item-color-bg-active`,
        value: `var(--rt-color-action-primary)`,
    },
    {
        name: `--rt-nav-panel-group-font-size`,
        value: `var(--rt-text-xs)`,
    },
    {
        name: `--rt-nav-panel-group-font-weight`,
        value: `var(--rt-font-weight-medium)`,
    },
    {
        lead: `    /* Заголовок группы светлее пункта, и оба берут порог контраста на белой панели.
       Отношения обеих пар считает проверка тёмной темы; таблица замера — на странице
       «Colors» витрины. */`,
        space: true,
        name: `--rt-nav-panel-group-color`,
        value: `var(--rt-neutral-600)`,
        dark: `var(--rt-neutral-400)`,
    },
    {
        name: `--rt-nav-panel-group-content-gap`,
        value: `var(--rt-space-2)`,
    },
    {
        lead: `    /* Маркер непросмотренного. Точка стоит в потоке следом за подписью — и в ряду
       разделов, и в панели, и на узком экране: место ей даёт общий зазор
       содержимого пункта. */`,
        space: true,
        name: `--rt-nav-caret-size`,
        value: `var(--rt-size-3)`,
    },
    {
        name: `--rt-nav-marker-size`,
        value: `var(--rt-size-1)`,
    },
    {
        name: `--rt-nav-marker-color`,
        value: `var(--rt-color-state-danger)`,
    },
];
