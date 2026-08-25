/* Ступени шкалы: тени, габариты и всё, что задаёт поведение, — высота контролов,
   прозрачность состояний, движение, толщина рамки, прозрачные оттенки, слои и точки перелома.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`. */

export const scaleEffects = [
    {
        lead: `    /* Shadows — shadow-card литерал (НЕ алиас на shadow-md) */`,
        space: true,
        name: `--rt-shadow-none`,
        value: `none`,
    },
    {
        name: `--rt-shadow-sm`,
        value: `0 1px 2px rgb(0 0 0 / 5%)`,
    },
    {
        name: `--rt-shadow-md`,
        value: `0 4px 6px -1px rgb(0 0 0 / 10%), 0 2px 4px -2px rgb(0 0 0 / 6%)`,
    },
    {
        name: `--rt-shadow-lg`,
        value: `0 10px 15px -3px rgb(0 0 0 / 10%), 0 4px 6px -4px rgb(0 0 0 / 6%)`,
    },
    {
        name: `--rt-shadow-xl`,
        value: `0 20px 25px -5px rgb(0 0 0 / 12%), 0 8px 10px -6px rgb(0 0 0 / 8%)`,
    },
    {
        name: `--rt-shadow-card`,
        value: `0 4px 16px rgb(0 0 0 / 8%)`,
    },
    {
        lead: `    /* Soft glow shadow для карточек/секций — широкое размытие. */`,
        space: true,
        name: `--rt-shadow-card-soft`,
        value: `0 0 40px rgb(0 0 0 / 10%)`,
    },
    {
        lead: `    /* Тень панели навигации — три слоя от плотного к рассеянному: панель на
       полтора экрана шириной должна отделяться от страницы без тёмной кромки. */`,
        space: true,
        name: `--rt-shadow-nav-panel`,
        value: `0 8px 24px rgb(0 0 0 / 8%), 0 12px 32px rgb(0 0 0 / 4%), 0 16px 48px rgb(0 0 0 / 2%)`,
    },
    {
        lead: `    /* Тень попапа профиля — один плотный слой: панель узкая, и рассеянные слои
       панели навигации размазывают её край вместо того, чтобы его очертить. */`,
        space: true,
        name: `--rt-shadow-profile-menu`,
        value: `0 16px 32px rgb(0 0 0 / 15%)`,
    },
    {
        lead: `    /* Тень окна — тот же силуэт, что у shadow-card-soft, но вдвое плотнее: окно
       лежит поверх затемнённой страницы, и слабый ореол на ней не читается. */`,
        space: true,
        name: `--rt-shadow-dialog`,
        value: `0 0 40px rgb(0 0 0 / 25%)`,
    },
    {
        lead: `    /* Size — шкала габаритов: ширина, высота и сторона квадратного узла там, где их
       задаёт не содержимое. Множитель тот же, что у отступов: ступень N равна N × 4px,
       и ряд идёт без промежуточных ступеней — габарит, не легший на ряд, округляется к
       соседней, а не заводит себе ступень по месту. */`,
        space: true,
        name: `--rt-size-1`,
        value: `4px`,
    },
    {
        name: `--rt-size-2`,
        value: `8px`,
    },
    {
        name: `--rt-size-3`,
        value: `12px`,
    },
    {
        name: `--rt-size-4`,
        value: `16px`,
    },
    {
        name: `--rt-size-5`,
        value: `20px`,
    },
    {
        name: `--rt-size-6`,
        value: `24px`,
    },
    {
        name: `--rt-size-8`,
        value: `32px`,
    },
    {
        name: `--rt-size-10`,
        value: `40px`,
    },
    {
        name: `--rt-size-12`,
        value: `48px`,
    },
    {
        name: `--rt-size-16`,
        value: `64px`,
    },
    {
        name: `--rt-size-20`,
        value: `80px`,
    },
    {
        name: `--rt-size-24`,
        value: `96px`,
    },
    {
        name: `--rt-size-30`,
        value: `120px`,
    },
    {
        name: `--rt-size-40`,
        value: `160px`,
    },
    {
        name: `--rt-size-60`,
        value: `240px`,
    },
    {
        name: `--rt-size-64`,
        value: `256px`,
    },
    {
        name: `--rt-size-100`,
        value: `400px`,
    },
    {
        lead: `    /* Control height — одна шкала высот на все интерактивные контролы: кнопку,
       иконочную кнопку и семейство полей. Ряд идёт шагом 8px и ложится на сетку
       отступов; ступень md остаётся сорока, потому что это самый ходовой размер
       кнопки.

       До свода рядов было три, и в одной строке они не совпадали: кнопка шла
       30/40/50/60/70, поле 36/45/52, иконочная кнопка 28/36/44/52/60. */`,
        space: true,
        name: `--rt-control-height-sm`,
        value: `32px`,
    },
    {
        name: `--rt-control-height-md`,
        value: `40px`,
    },
    {
        name: `--rt-control-height-lg`,
        value: `48px`,
    },
    {
        name: `--rt-control-height-xl`,
        value: `56px`,
    },
    {
        name: `--rt-control-height-2xl`,
        value: `64px`,
    },
    {
        name: `--rt-control-textarea-min-height-sm`,
        value: `80px`,
    },
    {
        name: `--rt-control-textarea-min-height-md`,
        value: `120px`,
    },
    {
        name: `--rt-control-textarea-min-height-lg`,
        value: `160px`,
    },
    {
        name: `--rt-control-panel-max-height`,
        value: `256px`,
    },
    {
        name: `--rt-control-max-width`,
        value: `400px`,
    },
    {
        lead: `    /* Opacity states */`,
        space: true,
        name: `--rt-opacity-disabled`,
        value: `0.6`,
    },
    {
        lead: `    /* Motion */`,
        space: true,
        name: `--rt-duration-fast`,
        value: `120ms`,
    },
    {
        name: `--rt-duration-base`,
        value: `200ms`,
    },
    {
        name: `--rt-duration-slow`,
        value: `400ms`,
    },
    {
        name: `--rt-duration-slower`,
        value: `500ms`,
    },
    {
        lead: `    /* Typography helpers */`,
        space: true,
        name: `--rt-letter-spacing-wide`,
        value: `0.03em`,
    },
    {
        lead: `    /* Border-width */`,
        space: true,
        name: `--rt-border-width-thin`,
        value: `1px`,
    },
    {
        name: `--rt-border-width-medium`,
        value: `2px`,
    },
    {
        name: `--rt-border-width-thick`,
        value: `3px`,
    },
    {
        lead: `    /* Alpha overlays — для backdrop'ов и focus-ring tint'ов. */`,
        space: true,
        name: `--rt-overlay-black-4`,
        value: `rgb(0 0 0 / 4%)`,
    },
    {
        name: `--rt-overlay-black-8`,
        value: `rgb(0 0 0 / 8%)`,
        note: `наведение поверх приглушённой поверхности: она сама стоит на четырёх процентах`,
    },
    {
        name: `--rt-overlay-white-4`,
        value: `rgb(255 255 255 / 4%)`,
    },
    {
        name: `--rt-overlay-white-8`,
        value: `rgb(255 255 255 / 8%)`,
        note: `то же на графите`,
    },
    {
        name: `--rt-overlay-white-25`,
        value: `rgb(250 250 250 / 25%)`,
        note: `disabled-текст на графите`,
    },
    {
        name: `--rt-overlay-white-40`,
        value: `rgb(250 250 250 / 40%)`,
        note: `приглушённый знак: порога не берёт`,
    },
    {
        name: `--rt-overlay-white-50`,
        value: `rgb(250 250 250 / 50%)`,
        note: `приглушённый текст: слабее порог не берётся`,
    },
    {
        name: `--rt-overlay-black-50`,
        value: `rgb(0 0 0 / 50%)`,
    },
    {
        lead: `    /* Оттенки марки считаются от её ступени, а не повторяют код цвета: повторённое
       значение расходится с источником молча, и перекрасивший бренд получал бы прежний
       синий в подложке действия и в кольце фокуса. */`,
        space: true,
        name: `--rt-overlay-brand-8`,
        value: `color-mix(in srgb, var(--rt-brand-500) 8%, transparent)`,
    },
    {
        name: `--rt-overlay-brand-24`,
        value: `color-mix(in srgb, var(--rt-brand-500) 24%, transparent)`,
    },
    {
        name: `--rt-overlay-danger-16`,
        value: `color-mix(in srgb, var(--rt-danger-500) 16%, transparent)`,
    },
    {
        name: `--rt-overlay-amber-16`,
        value: `color-mix(in srgb, var(--rt-amber-400) 16%, transparent)`,
    },
    {
        lead: `    /* Подложка окна — синеватая, а не чёрная: окно стоит на странице обвязки, и
       чёрное затемнение под ним холоднее её синевы. Считается от ступени обвязки
       по той же причине, что и оттенки марки. */`,
        space: true,
        name: `--rt-overlay-navy-70`,
        value: `color-mix(in srgb, var(--rt-navy-900) 70%, transparent)`,
    },
    {
        lead: `    /* Z-index */`,
        space: true,
        name: `--rt-z-base`,
        value: `0`,
    },
    {
        name: `--rt-z-dropdown`,
        value: `1000`,
    },
    {
        name: `--rt-z-sticky`,
        value: `1100`,
    },
    {
        name: `--rt-z-fixed`,
        value: `1200`,
    },
    {
        name: `--rt-z-modal-backdrop`,
        value: `1300`,
    },
    {
        name: `--rt-z-modal`,
        value: `1400`,
    },
    {
        name: `--rt-z-popover`,
        value: `1500`,
    },
    {
        name: `--rt-z-tooltip`,
        value: `1600`,
    },
    {
        lead: `    /* Breakpoints — справочные CSS-vars (для JS-чтения \`getComputedStyle\`);
       реальные media queries используют SCSS-переменные из \`_breakpoints.scss\`. */`,
        space: true,
        name: `--rt-bp-sm`,
        value: `480px`,
    },
    {
        name: `--rt-bp-md`,
        value: `768px`,
    },
    {
        name: `--rt-bp-lg`,
        value: `1080px`,
    },
    {
        name: `--rt-bp-xl`,
        value: `1380px`,
    },
];
