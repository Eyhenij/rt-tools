/* Назначения светлой темы: цвет отдельных частей кита. Рельса шагов с её ореолами, переписка
   и поверхность входа — вместе с ответом тёмной темы в поле `dark`.

   Отделено от `tokens.light-color.mjs` по предмету: там цвет ролей палитры — подложка, текст,
   рамка, действие, кольцо фокуса, состояния; здесь цвет названной части, у которой своей роли
   в палитре нет. Делить пришлось по длине файла, и граница проведена там, где она и так была.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`, он же собирает
   `light` из этой части и соседних. */

export const lightParts = [
    {
        lead: `    /* Data table (rt-data-table) — заливка шапки. Своё имя, а не подложка роли: в материальном
       наборе шапка залита цветом залитого поля, как у первого кита, а подложка роли остаётся
       серой у всех остальных частей кита. Тёмная тема отвечает на имя сама: без ответа она
       уступила бы его материальному набору, и тёмная шапка получила бы светлую заливку. */`,
        space: true,
        name: `--rt-color-table-head-bg`,
        value: `var(--rt-color-bg-surface-subtle)`,
        dark: `var(--rt-color-bg-surface-subtle)`,
    },
    {
        lead: `    /* Залитое поле (вид fill у поля ввода, числа, даты и выбора) — черта снизу. Своё имя,
       а не рамка роли: в материальном наборе она берёт цвет черты поля Material, а рамка роли
       остаётся светлой у всех остальных частей кита. Тёмная тема отвечает на имя сама. */`,
        space: true,
        name: `--rt-color-field-fill-underline`,
        value: `var(--rt-color-border-strong)`,
        dark: `var(--rt-color-border-strong)`,
    },
    {
        lead: `    /* Stepper (rt-stepper) — рельса прогресса. Текущий шаг — янтарный (одинаков
       в обеих темах); трек/прогресс переопределяются в dark на приглушённые. */`,
        space: true,
        name: `--rt-color-stepper-current`,
        value: `var(--rt-amber-400)`,
        note: `rt-theme-shared: янтарь текущего шага один в обеих темах`,
        presetShared: `янтарь текущего шага — метка хода, а не цвет роли: ступени такого цвета у
       материальной шкалы нет, а нарисованная её акцентом метка сделает текущий шаг неотличимым
       от пройденного`,
    },
    {
        name: `--rt-color-stepper-current-subtle`,
        value: `var(--rt-overlay-amber-16)`,
        note: `rt-theme-shared: янтарь текущего шага один в обеих темах`,
        presetShared: `ореол считается от янтаря выше и следует за ним: получив здесь свой цвет,
       кольцо и его середина разъедутся в одном материальном наборе`,
    },
    {
        name: `--rt-color-stepper-track`,
        value: `var(--rt-gray-350)`,
        dark: `var(--rt-navy-600)`,
    },
    {
        name: `--rt-color-stepper-progress`,
        value: `var(--rt-color-action-primary)`,
        dark: `var(--rt-slate-300)`,
    },
    {
        lead: `    /* Step-indicator ring — halo вокруг активного пункта rt-stepper. */`,
        space: true,
        name: `--rt-shadow-step-indicator`,
        value: `0 0 0 4px var(--rt-color-stepper-current-subtle)`,
    },
    {
        lead: `    /* Status-dot ring — halo вокруг точки «объект занят сейчас». */`,
        space: true,
        name: `--rt-shadow-status-dot`,
        value: `0 0 0 3px var(--rt-color-state-success-bg)`,
    },
    {
        lead: `    /* Chat — пузыри переписки. Входящее и своё различаются фоном, а не рамкой:
       рамка на каждом пузыре дробит ленту. Отметка прочтения синяя — единственный
       цветной элемент подвала пузыря, остальные статусы приглушены. */`,
        space: true,
        name: `--rt-chat-bubble-in-bg`,
        value: `var(--rt-brand-50)`,
        dark: `color-mix(in srgb, var(--rt-brand-500) 12%, transparent)`,
    },
    {
        name: `--rt-chat-bubble-in-author`,
        value: `var(--rt-brand-700)`,
        dark: `var(--rt-brand-300)`,
    },
    {
        name: `--rt-chat-bubble-own-bg`,
        value: `var(--rt-neutral-100)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        name: `--rt-chat-bubble-own-author`,
        value: `var(--rt-neutral-500)`,
        dark: `var(--rt-overlay-white-40)`,
    },
    {
        name: `--rt-chat-bubble-date`,
        value: `var(--rt-color-text-muted)`,
        dark: `var(--rt-overlay-white-40)`,
    },
    {
        name: `--rt-chat-status-read`,
        value: `var(--rt-brand-400)`,
        dark: `var(--rt-brand-300)`,
    },
    {
        lead: `    /* Special — Auth surface (gradient bg + transparent card в dark) */`,
        space: true,
        name: `--rt-color-bg-page-auth`,
        value: `var(--rt-neutral-50)`,
        dark: `linear-gradient(156deg, var(--rt-neutral-950) 12.68%, var(--rt-navy-900) 99.28%)`,
    },
    {
        name: `--rt-color-bg-surface-auth-card`,
        value: `var(--rt-neutral-0)`,
        dark: `transparent`,
    },
    {
        lead: `    /* Skeleton (rt-skeleton) — заглушка загрузки. Два конца перелива: покой и гребень
       волны. Имена свои, а не роли подложки и рамки: в светлом наборе те ведут на одну краску,
       и перелив между ними стоял ровной заливкой. */`,
        space: true,
        name: `--rt-color-skeleton-base`,
        value: `var(--rt-neutral-100)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        name: `--rt-color-skeleton-wave`,
        value: `var(--rt-neutral-50)`,
        dark: `var(--rt-charcoal-border)`,
    },
];
