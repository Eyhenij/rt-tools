/* Назначения светлой темы: цвет. Подложка, текст, рамка, роли действия, кольцо фокуса,
   рельса шагов, состояния, переписка и особые поверхности — вместе с ответом тёмной темы в
   поле `dark`.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`, он же собирает
   `light` из этой части и соседних. */

export const lightColor = [
    {
        lead: `    /* Background */`,
        name: `--rt-color-bg-page`,
        value: `var(--rt-neutral-50)`,
        dark: `var(--rt-charcoal-900)`,
    },
    {
        name: `--rt-color-bg-surface`,
        value: `var(--rt-neutral-0)`,
        dark: `var(--rt-charcoal-800)`,
    },
    {
        name: `--rt-color-bg-surface-subtle`,
        value: `var(--rt-overlay-black-4)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        name: `--rt-color-bg-surface-subtle-2`,
        value: `var(--rt-neutral-200)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        name: `--rt-color-bg-hover`,
        value: `var(--rt-overlay-black-4)`,
        dark: `var(--rt-charcoal-700)`,
    },
    {
        name: `--rt-color-bg-subtle`,
        value: `var(--rt-neutral-100)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        name: `--rt-color-bg-overlay`,
        value: `var(--rt-overlay-black-50)`,
        dark: `rgb(0 0 0 / 70%)`,
    },
    {
        name: `--rt-color-bg-inverse`,
        value: `var(--rt-neutral-900)`,
        dark: `var(--rt-neutral-0)`,
    },
    {
        lead: `    /* Подложка обвязки — шапка и боковая навигация. Отдельно от bg-inverse: тот
       нейтральный и работает под перевёрнутым текстом, а этот синеватый и в обеих
       темах один. */`,
        space: true,
        name: `--rt-color-bg-nav`,
        value: `var(--rt-navy-900)`,
        note: `rt-theme-shared: обвязка тёмная в обеих темах`,
    },
    {
        lead: `    /* Text */`,
        space: true,
        name: `--rt-color-text-primary`,
        value: `var(--rt-neutral-900)`,
        dark: `var(--rt-neutral-50)`,
    },
    {
        lead: `    /* Ступень 600, а не 500: приглушённый текст обязан брать порог, а после
       пересчёта ряда самая светлая ступень, которая его берёт, — шестисотая.
       Прежде эту роль держала off-grid ступень 510, заведённая ровно под неё. */`,
        space: true,
        name: `--rt-color-text-muted`,
        value: `var(--rt-neutral-600)`,
        dark: `var(--rt-overlay-white-40)`,
    },
    {
        name: `--rt-color-text-disabled`,
        value: `var(--rt-neutral-400)`,
        dark: `var(--rt-overlay-white-25)`,
    },
    {
        name: `--rt-color-text-inverse`,
        value: `var(--rt-neutral-0)`,
        dark: `var(--rt-neutral-900)`,
    },
    {
        name: `--rt-color-text-link`,
        value: `var(--rt-brand-500)`,
        dark: `var(--rt-brand-300)`,
    },
    {
        name: `--rt-color-text-link-hover`,
        value: `var(--rt-brand-600)`,
        dark: `var(--rt-brand-500)`,
    },
    {
        lead: `    /* Border */`,
        space: true,
        name: `--rt-color-border-default`,
        value: `var(--rt-neutral-100)`,
        dark: `var(--rt-charcoal-border)`,
    },
    {
        name: `--rt-color-border-strong`,
        value: `var(--rt-neutral-300)`,
        dark: `var(--rt-charcoal-border-strong)`,
    },
    {
        name: `--rt-color-border-subtle`,
        value: `var(--rt-neutral-100)`,
        dark: `var(--rt-charcoal-border)`,
    },
    {
        name: `--rt-color-border-focus`,
        value: `var(--rt-brand-500)`,
        dark: `var(--rt-brand-500)`,
    },
    {
        lead: `    /* Action — роли действия.

       Роль это пятёрка: подложка, наведение, нажатие, подпись на них и цвет самой
       роли на поверхности. Кнопка берёт роль целиком и своих цветов не знает вовсе,
       поэтому смена роли — одна строка здесь, а не правка стилей компонента.
       Наведение и нажатие — соседние ступени своей шкалы; подпись светлая у всех
       ролей, потому что все подложки тёмные.

       Пятый член — \`-on-surface\` — красит безфоновые оформления: текстовое и
       обводочное берут им подпись и рамку. Отдельным именем, а не подложкой роли:
       подложка вправе быть поверхностью, и у вторичной роли на графите она ею
       становится — подпись, взятая из подложки, легла бы сама на себя. У пяти ролей
       цвет тот же, что и у подложки, и это записано ссылкой, а не повтором
       значения. */`,
        space: true,
        name: `--rt-color-action-primary`,
        value: `var(--rt-brand-500)`,
        note: `rt-theme-shared: цвет марки один в обеих темах`,
    },
    {
        name: `--rt-color-action-primary-hover`,
        value: `var(--rt-brand-600)`,
        note: `rt-theme-shared: цвет марки один в обеих темах`,
    },
    {
        name: `--rt-color-action-primary-active`,
        value: `var(--rt-brand-700)`,
        note: `rt-theme-shared: цвет марки один в обеих темах`,
    },
    {
        name: `--rt-color-action-primary-subtle`,
        value: `var(--rt-overlay-brand-8)`,
        dark: `color-mix(in srgb, var(--rt-brand-500) 16%, transparent)`,
    },
    {
        lead: `    /* Focus-ring tint — насыщеннее subtle, для visible 3px outline. */`,
        space: true,
        name: `--rt-color-action-primary-soft`,
        value: `var(--rt-overlay-brand-24)`,
        dark: `color-mix(in srgb, var(--rt-brand-500) 32%, transparent)`,
    },
    {
        name: `--rt-color-action-on-primary`,
        value: `var(--rt-neutral-0)`,
        note: `rt-theme-shared: подпись на действии марки светлая в обеих темах`,
    },
    {
        name: `--rt-color-action-primary-on-surface`,
        value: `var(--rt-color-action-primary)`,
    },
    {
        lead: `    /* Вторичное действие — единственная роль без своего цвета: она нейтральна и на
       графите разворачивается в подложку поверхности, поэтому тёмная тема отвечает
       на всю её тройку. По той же причине пятый член у неё свой: подложкой роли на
       графите красить подпись нечем. */`,
        space: true,
        name: `--rt-color-action-secondary`,
        value: `var(--rt-neutral-600)`,
        dark: `var(--rt-charcoal-700)`,
    },
    {
        name: `--rt-color-action-secondary-hover`,
        value: `var(--rt-neutral-700)`,
        dark: `var(--rt-charcoal-border)`,
    },
    {
        name: `--rt-color-action-secondary-active`,
        value: `var(--rt-neutral-800)`,
        dark: `var(--rt-charcoal-border-strong)`,
    },
    {
        name: `--rt-color-action-on-secondary`,
        value: `var(--rt-neutral-0)`,
        dark: `var(--rt-neutral-50)`,
    },
    {
        name: `--rt-color-action-secondary-on-surface`,
        value: `var(--rt-neutral-600)`,
        dark: `var(--rt-neutral-400)`,
    },
    {
        name: `--rt-color-action-success`,
        value: `var(--rt-success-500)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-success-hover`,
        value: `var(--rt-success-600)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-success-active`,
        value: `var(--rt-success-700)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-on-success`,
        value: `var(--rt-neutral-0)`,
        note: `rt-theme-shared: подпись на цветной подложке светлая в обеих темах`,
    },
    {
        name: `--rt-color-action-success-on-surface`,
        value: `var(--rt-color-action-success)`,
    },
    {
        name: `--rt-color-action-warning`,
        value: `var(--rt-warning-500)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-warning-hover`,
        value: `var(--rt-warning-600)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-warning-active`,
        value: `var(--rt-warning-700)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-on-warning`,
        value: `var(--rt-neutral-0)`,
        note: `rt-theme-shared: подпись на цветной подложке светлая в обеих темах`,
    },
    {
        name: `--rt-color-action-warning-on-surface`,
        value: `var(--rt-color-action-warning)`,
    },
    {
        name: `--rt-color-action-danger`,
        value: `var(--rt-danger-500)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-danger-hover`,
        value: `var(--rt-danger-600)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-danger-active`,
        value: `var(--rt-danger-700)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-on-danger`,
        value: `var(--rt-neutral-0)`,
        note: `rt-theme-shared: подпись на цветной подложке светлая в обеих темах`,
    },
    {
        name: `--rt-color-action-danger-on-surface`,
        value: `var(--rt-color-action-danger)`,
    },
    {
        name: `--rt-color-action-info`,
        value: `var(--rt-info-500)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-info-hover`,
        value: `var(--rt-info-600)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-info-active`,
        value: `var(--rt-info-700)`,
        note: `rt-theme-shared: цвет роли один в обеих темах`,
    },
    {
        name: `--rt-color-action-on-info`,
        value: `var(--rt-neutral-0)`,
        note: `rt-theme-shared: подпись на цветной подложке светлая в обеих темах`,
    },
    {
        name: `--rt-color-action-info-on-surface`,
        value: `var(--rt-color-action-info)`,
    },
    {
        lead: `    /* Отключённое действие — своя пара, а не вторичная роль: делить подложку с ней
       значит сделать отключённую вторичную кнопку неотличимой от доступной. */`,
        space: true,
        name: `--rt-color-action-disabled`,
        value: `var(--rt-neutral-200)`,
        dark: `var(--rt-charcoal-700)`,
    },
    {
        name: `--rt-color-action-on-disabled`,
        value: `var(--rt-color-text-disabled)`,
    },
    {
        lead: `    /* Доли оттенка под наведение и нажатие безфоновых оформлений кнопки. Живут в
       слое, а не в стилях компонента: тёмная тема их поднимает, а половина пары,
       оставшаяся в компоненте, тёмному ответу не видна. */`,
        space: true,
        name: `--rt-btn-tint-hover`,
        value: `8%`,
        dark: `16%`,
    },
    {
        name: `--rt-btn-tint-active`,
        value: `16%`,
        dark: `32%`,
    },
    {
        lead: `    /* Кольцо фокуса разобрано на составляющие: толщину, отступ и цвет. Композит
       собирается из них и остаётся на месте — восемь компонентов берут его целиком, и
       менять их незачем. Отступ — зазор цвета поверхности между элементом и кольцом:
       первая тень при нулевом отступе не рисует ничего. */`,
        space: true,
        name: `--rt-focus-ring-width`,
        value: `var(--rt-border-width-thick)`,
    },
    {
        lead: `    /* Ноль с единицей намеренно: безразмерный ноль внутри calc с длиной невалиден, и
       браузер отбрасывает объявление кольца целиком — кольцо просто пропадает. */`,
        space: true,
        name: `--rt-focus-ring-offset`,
        value: `0px`,
    },
    {
        name: `--rt-focus-ring-color`,
        value: `var(--rt-color-action-primary-soft)`,
    },
    {
        name: `--rt-focus-ring-color-danger`,
        value: `var(--rt-overlay-danger-16)`,
        note: `rt-theme-shared: оттенок опасного действия один в обеих темах`,
    },
    {
        lead: `    /* Focus-ring composite — для interactive элементов с custom focus-visible. */`,
        space: true,
        name: `--rt-shadow-focus-ring`,
        value: `0 0 0 var(--rt-focus-ring-offset) var(--rt-color-bg-surface),
        0 0 0 calc(var(--rt-focus-ring-offset) + var(--rt-focus-ring-width)) var(--rt-focus-ring-color)`,
    },
    {
        name: `--rt-shadow-focus-ring-danger`,
        value: `0 0 0 var(--rt-focus-ring-offset) var(--rt-color-bg-surface),
        0 0 0 calc(var(--rt-focus-ring-offset) + var(--rt-focus-ring-width)) var(--rt-focus-ring-color-danger)`,
    },
    {
        lead: `    /* Stepper (rt-stepper) — рельса прогресса. Текущий шаг — янтарный (одинаков
       в обеих темах); трек/прогресс переопределяются в dark на приглушённые. */`,
        space: true,
        name: `--rt-color-stepper-current`,
        value: `var(--rt-amber-400)`,
        note: `rt-theme-shared: янтарь текущего шага один в обеих темах`,
    },
    {
        name: `--rt-color-stepper-current-subtle`,
        value: `var(--rt-overlay-amber-16)`,
        note: `rt-theme-shared: янтарь текущего шага один в обеих темах`,
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
        lead: `    /* State */`,
        space: true,
        name: `--rt-color-state-success`,
        value: `var(--rt-success-500)`,
        note: `rt-theme-shared: цвет статуса один в обеих темах`,
    },
    {
        name: `--rt-color-state-success-bg`,
        value: `var(--rt-success-50)`,
        dark: `color-mix(in srgb, var(--rt-success-500) 12%, transparent)`,
    },
    {
        name: `--rt-color-state-warning`,
        value: `var(--rt-warning-500)`,
        note: `rt-theme-shared: цвет статуса один в обеих темах`,
    },
    {
        name: `--rt-color-state-warning-bg`,
        value: `var(--rt-warning-50)`,
        dark: `color-mix(in srgb, var(--rt-warning-500) 12%, transparent)`,
    },
    {
        lead: `    /* Подпись на подложке предупреждения — ступенью темнее самого статуса: сам
       статус на своей подложке порога контраста не берёт. Пара к error-text. */`,
        space: true,
        name: `--rt-color-state-warning-text`,
        value: `var(--rt-warning-600)`,
        dark: `var(--rt-warning-500)`,
    },
    {
        name: `--rt-color-state-danger`,
        value: `var(--rt-danger-500)`,
        note: `rt-theme-shared: цвет статуса один в обеих темах`,
    },
    {
        name: `--rt-color-state-danger-bg`,
        value: `var(--rt-danger-50)`,
        dark: `color-mix(in srgb, var(--rt-danger-500) 12%, transparent)`,
    },
    {
        name: `--rt-color-state-error-text`,
        value: `var(--rt-danger-600)`,
        dark: `var(--rt-danger-500)`,
    },
    {
        name: `--rt-color-state-info`,
        value: `var(--rt-info-500)`,
        note: `rt-theme-shared: цвет статуса один в обеих темах`,
    },
    {
        name: `--rt-color-state-info-bg`,
        value: `var(--rt-info-50)`,
        dark: `color-mix(in srgb, var(--rt-info-500) 12%, transparent)`,
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
];
