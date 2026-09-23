/* Порядок и записки тёмного файла: имена, которые тёмная тема переопределяет, в том порядке,
   в каком они встают в собранный файл. Сами ответы живут рядом со своими светлыми
   назначениями.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`. */

export const darkLayout = [
    {
        lead: `    /* Background — тёплый графит */`,
        name: `--rt-color-bg-page`,
    },
    {
        name: `--rt-color-bg-surface`,
    },
    {
        name: `--rt-color-bg-surface-subtle`,
    },
    {
        name: `--rt-color-bg-surface-subtle-2`,
    },
    {
        name: `--rt-color-bg-hover`,
    },
    {
        name: `--rt-color-bg-subtle`,
    },
    {
        name: `--rt-color-bg-overlay`,
    },
    {
        name: `--rt-color-bg-inverse`,
    },
    {
        lead: `    /* Text — почти белый на графите */`,
        space: true,
        name: `--rt-color-text-primary`,
    },
    {
        name: `--rt-color-text-muted`,
    },
    {
        name: `--rt-color-text-disabled`,
    },
    {
        name: `--rt-color-text-inverse`,
    },
    {
        name: `--rt-color-text-link`,
    },
    {
        name: `--rt-color-text-link-hover`,
    },
    {
        lead: `    /* Border — приглушённые на графите */`,
        space: true,
        name: `--rt-color-border-default`,
    },
    {
        name: `--rt-color-border-strong`,
    },
    {
        name: `--rt-color-border-subtle`,
    },
    {
        name: `--rt-color-border-focus`,
    },
    {
        lead: `    /* Input border видим в dark (в light — transparent). */`,
        space: true,
        name: `--rt-input-color-border`,
    },
    {
        lead: `    /* Stepper — в dark рельса уходит от яркого синего к приглушённому серо-синему
       (текущий шаг остаётся янтарным из light-семантики). */`,
        space: true,
        name: `--rt-color-stepper-track`,
    },
    {
        name: `--rt-color-stepper-progress`,
    },
    {
        lead: `    /* Шапка таблицы — та же подложка роли, что в светлой: ответ стоит, чтобы тёмная тема
       выигрывала у материального набора и на этом имени. */`,
        space: true,
        name: `--rt-color-table-head-bg`,
    },
    {
        lead: `    /* Навигация — вся шкала серых разворачивается: подложка уходит глубже
       поверхности, а приглушённые подписи становятся светлее фона, а не темнее.
       Плашка шапки садится на глубокий графит, активный пункт поднимается на
       поверхность карточки — то же отношение, что и в светлой теме. */`,
        space: true,
        name: `--rt-nav-header-color-bg`,
    },
    {
        name: `--rt-nav-item-color-bg`,
    },
    {
        name: `--rt-nav-item-color-border`,
    },
    {
        name: `--rt-nav-item-color-bg-active`,
    },
    {
        name: `--rt-nav-item-color-caret`,
    },
    {
        name: `--rt-nav-panel-color-bg`,
    },
    {
        name: `--rt-nav-panel-color-border`,
    },
    {
        name: `--rt-nav-panel-item-color`,
    },
    {
        name: `--rt-nav-panel-item-color-bg-hover`,
    },
    {
        name: `--rt-nav-panel-group-color`,
    },
    {
        name: `--rt-nav-color-disabled`,
    },
    {
        lead: `    /* Action — сам цвет марки один в обеих темах, а доля оттенка на графите вдвое
       больше: слабый оттенок на тёмном фоне просто не виден. Считается от ступени
       бренда, как и в светлой теме. */`,
        space: true,
        name: `--rt-color-action-primary-subtle`,
    },
    {
        lead: `    /* Focus-ring в dark — ярче для контрастности на тёмных фонах. */`,
        space: true,
        name: `--rt-color-action-primary-soft`,
    },
    {
        lead: `    /* Вторичное действие нейтрально, и на графите вся его тройка разворачивается:
       подложка садится на приподнятую поверхность, а наведение и нажатие идут вверх
       по светлоте, а не вниз, — иначе они тонут в фоне страницы. */`,
        space: true,
        name: `--rt-color-action-secondary`,
    },
    {
        name: `--rt-color-action-secondary-hover`,
    },
    {
        name: `--rt-color-action-secondary-active`,
    },
    {
        name: `--rt-color-action-on-secondary`,
    },
    {
        lead: `    /* Пятый член роли идёт против всей её тройки: подложка садится на поверхность,
       а цвет на поверхности обязан от неё оторваться. Ступень нейтрали, а не графита:
       графит кончается границей, и любая его ступень на карточке даёт меньше двух к
       одному. Светлая тема красит тем же именем, что и подложку, и разъехаться они
       могут только здесь. */`,
        space: true,
        name: `--rt-color-action-secondary-on-surface`,
    },
    {
        lead: `    /* Отключённое действие на графите — та же приподнятая поверхность; подпись
       наследует ответ тёмной темы по ссылке на приглушённый текст. */`,
        space: true,
        name: `--rt-color-action-disabled`,
    },
    {
        lead: `    /* Оттенок наведения на графите вдвое насыщеннее: слабый след на тёмном фоне
       не виден — та же причина, что и у оттенка марки выше. */`,
        space: true,
        name: `--rt-btn-tint-hover`,
    },
    {
        name: `--rt-btn-tint-active`,
    },
    {
        lead: `    /* Soft card-shadow в dark — насыщеннее для отделения от фона. */`,
        space: true,
        name: `--rt-shadow-card-soft`,
        value: `0 0 40px rgb(0 0 0 / 25%)`,
    },
    {
        lead: `    /* Hover-overlay инвертирован для dark (light overlay поверх тёмного фона). */`,
        space: true,
        name: `--rt-input-color-bg-hover`,
    },
    {
        name: `--rt-icon-button-color-bg-hover`,
    },
    {
        lead: `    /* Toggle-switch — трек уходит в подложку, а бегунок остаётся светлым:
       общий bg-surface на обоих слил бы их в один силуэт. Тень на графите
       не работает, роль разделителя берёт на себя контраст. */`,
        space: true,
        name: `--rt-toggle-color-track`,
    },
    {
        name: `--rt-toggle-color-thumb`,
    },
    {
        name: `--rt-toggle-shadow-thumb`,
    },
    {
        lead: `    /* State — surfaces под dark + ярче error-text.

       Подложка считается от ступени своего статуса, а не повторяет её код цвета
       тройкой каналов: повторённое значение расходится с источником молча, и
       правка ступени оставляла подложку прежней. */`,
        space: true,
        name: `--rt-color-state-success-bg`,
    },
    {
        name: `--rt-color-state-warning-bg`,
    },
    {
        name: `--rt-color-state-danger-bg`,
    },
    {
        name: `--rt-color-state-error-text`,
    },
    {
        name: `--rt-color-state-warning-text`,
    },
    {
        name: `--rt-color-state-info-bg`,
    },
    {
        lead: `    /* Chat — на графите светлые фоны пузырей нечитаемы: входящее уходит в
       полупрозрачный синий, своё — в глубокий графит. */`,
        space: true,
        name: `--rt-chat-bubble-in-bg`,
    },
    {
        name: `--rt-chat-bubble-in-author`,
    },
    {
        name: `--rt-chat-bubble-own-bg`,
    },
    {
        name: `--rt-chat-bubble-own-author`,
    },
    {
        name: `--rt-chat-bubble-date`,
    },
    {
        name: `--rt-chat-status-read`,
    },
    {
        lead: `    /* Special — Auth surface (градиентный фон логина + прозрачная карточка). */`,
        space: true,
        name: `--rt-color-bg-page-auth`,
    },
    {
        name: `--rt-color-bg-surface-auth-card`,
    },
    {
        lead: `    /* Skeleton — заглушка загрузки: покой и гребень волны. */`,
        space: true,
        name: `--rt-color-skeleton-base`,
    },
    {
        name: `--rt-color-skeleton-wave`,
    },
];
