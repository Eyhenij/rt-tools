/* Источник свойств оформления второго кита.

   Это единственное место, где объявление слоя оформления правится руками. Три файла стилей —
   `_primitives.scss`, `_semantic.scss`, `_theme-dark.scss` — и типы имён из `tokens.ts` пишет
   генератор `tools/build-tokens-v2.mjs`; правка в них теряется на следующей сборке, а сверку
   держит `pnpm run check:tokens-build`.

   Устройство узла: `scale` — ступени шкалы, `light` — назначения светлой темы вместе с
   ответом тёмной в поле `dark`, `darkLayout` — порядок и записки тёмного файла, `coarsePointer`
   — переопределение для грубого указателя. Поле `lead` несёт блок записки над объявлением,
   `note` — записку в его строке, обе уезжают в собранный файл как есть.

   Пара «светлая и тёмная» стоит в одном узле нарочно: забытая половина видна прямо здесь, а
   не вылавливается сверкой двух файлов. */

export const scale = [
    {
        lead: `    /* Neutral scale — серо-сине-стальная.

       Ряд посчитан в OKLCH: тон 264.4° и цветность 0.0234 взяты у прежней ступени 600,
       светлота идёт ровным шагом 0.0785 от 0.985 к 0.20. Ноль остаётся чистым белым —
       это бумага, а не ступень ряда. В самом светлом конце цветность ужата охватом
       sRGB: синеватого такой светлоты не существует.

       До пересчёта ряд шкалой не был. Он держал два семейства сразу — чисто серое
       (0, 50, 200, 500, 900) и синеватое (100, 300, 400, 600, 700, 800, 950), —
       шаг светлоты гулял от 0.009 до 0.173, а ступень 900 была темнее ступени 950,
       то есть ряд шёл назад. Ещё девять ступеней стояли между этими: заведённые под
       одно место, они выглядели шкалой, но выбрать из такого ряда было нельзя. */`,
        name: `--rt-neutral-0`,
        value: `#fff`,
    },
    {
        name: `--rt-neutral-50`,
        value: `#f8faff`,
    },
    {
        name: `--rt-neutral-100`,
        value: `#d8e0f0`,
    },
    {
        name: `--rt-neutral-200`,
        value: `#bfc7d6`,
    },
    {
        name: `--rt-neutral-300`,
        value: `#a6aebd`,
    },
    {
        name: `--rt-neutral-400`,
        value: `#8e96a4`,
    },
    {
        name: `--rt-neutral-500`,
        value: `#777e8c`,
    },
    {
        name: `--rt-neutral-600`,
        value: `#606775`,
    },
    {
        name: `--rt-neutral-700`,
        value: `#4b515f`,
    },
    {
        name: `--rt-neutral-800`,
        value: `#363c49`,
    },
    {
        name: `--rt-neutral-900`,
        value: `#232934`,
    },
    {
        name: `--rt-neutral-950`,
        value: `#111621`,
    },
    {
        lead: `    /* Бренд — линейка цвета марки. Потребитель перекрашивает кит объявлением этих
       одиннадцати ступеней после tokens.css: назначения, прозрачные оттенки и кольцо
       фокуса берут цвет отсюда сами, в обеих темах.

       Ряд посчитан в OKLCH: тон 262.87° и цветность взяты у ступени 500, светлота идёт
       ровными шагами от 0.97 к 0.20. Ступень 500 — сам цвет марки, поэтому светлый конец
       ряда темнее, чем у палитр, где 500 стоит серединой светлоты. У 600 и 700 цветность
       ужата: с полной они не влезают в охват sRGB. */`,
        space: true,
        name: `--rt-brand-50`,
        value: `#f0f5ff`,
    },
    {
        name: `--rt-brand-100`,
        value: `#cddaf1`,
    },
    {
        name: `--rt-brand-200`,
        value: `#a8bfea`,
    },
    {
        name: `--rt-brand-300`,
        value: `#7ea3e9`,
    },
    {
        name: `--rt-brand-400`,
        value: `#4e84f2`,
        note: `отметка прочтения в чате`,
    },
    {
        name: `--rt-brand-500`,
        value: `#155dfc`,
        note: `цвет марки`,
    },
    {
        name: `--rt-brand-600`,
        value: `#0047df`,
    },
    {
        name: `--rt-brand-700`,
        value: `#0038b5`,
    },
    {
        name: `--rt-brand-800`,
        value: `#012a8a`,
    },
    {
        name: `--rt-brand-900`,
        value: `#021d62`,
    },
    {
        name: `--rt-brand-950`,
        value: `#02113c`,
    },
    {
        lead: `    /* Navy — тёмная синева обвязки и рельсы прогресса. Цветом марки она не красится:
       перекрасивший бренд не ждёт, что вместе с кнопкой сменится подложка шапки. */`,
        space: true,
        name: `--rt-navy-600`,
        value: `#435775`,
        note: `трек прогресса, тёмная тема`,
    },
    {
        name: `--rt-navy-900`,
        value: `#182142`,
        note: `подложка шапки и боковой навигации`,
    },
    {
        lead: `    /* Charcoal — тёплый графит для тёмной темы. */`,
        space: true,
        name: `--rt-charcoal-950`,
        value: `#17181c`,
        note: `глубокий фон / приподнятая alt-поверхность, subtle`,
    },
    {
        name: `--rt-charcoal-900`,
        value: `#1b1f22`,
        note: `фон страницы`,
    },
    {
        name: `--rt-charcoal-800`,
        value: `#222629`,
        note: `основная поверхность / карточка`,
    },
    {
        name: `--rt-charcoal-700`,
        value: `#2a2f33`,
        note: `hover / приподнятая поверхность / secondary action`,
    },
    {
        name: `--rt-charcoal-border`,
        value: `#33383d`,
        note: `граница по умолчанию`,
    },
    {
        name: `--rt-charcoal-border-strong`,
        value: `#444a50`,
        note: `усиленная граница`,
    },
    {
        lead: `    /* Stepper rail — приглушённые оттенки трека/прогресса прогресс-полосы. */`,
        space: true,
        name: `--rt-gray-350`,
        value: `#b3b3b3`,
        note: `трек, light`,
    },
    {
        name: `--rt-slate-300`,
        value: `#a9b8cd`,
        note: `пройденный прогресс, dark`,
    },
    {
        lead: `    /* Status — success/warning/danger/info.

       Ступени 600 и 700 считаны от своей 500 ровным шагом светлоты линейки бренда
       (ΔL = 0.0687 в OKLCH): тон и цветность берутся у 500, светлота убывает шагом.
       До этого ряды были собраны вручную и шли неровно — у успеха 700 была светлее
       600, а у опасности 600 отличалась от 500 неразличимо на глаз. Наведение и
       нажатие действия берут именно эти ступени, и такая пара их сливала. */`,
        space: true,
        name: `--rt-success-50`,
        value: `#ecfdf5`,
    },
    {
        name: `--rt-success-100`,
        value: `#eafaf5`,
    },
    {
        name: `--rt-success-500`,
        value: `#059669`,
    },
    {
        name: `--rt-success-600`,
        value: `#017f58`,
    },
    {
        name: `--rt-success-700`,
        value: `#006848`,
    },
    {
        name: `--rt-warning-50`,
        value: `#fffbeb`,
    },
    {
        name: `--rt-warning-500`,
        value: `#d97706`,
    },
    {
        name: `--rt-warning-600`,
        value: `#bc6600`,
    },
    {
        name: `--rt-warning-700`,
        value: `#9f5500`,
    },
    {
        name: `--rt-yellow-400`,
        value: `#f4d85a`,
    },
    {
        name: `--rt-amber-400`,
        value: `#f49f5a`,
    },
    {
        name: `--rt-danger-50`,
        value: `#fef2f2`,
    },
    {
        name: `--rt-danger-500`,
        value: `#dc2626`,
    },
    {
        name: `--rt-danger-600`,
        value: `#c00111`,
    },
    {
        name: `--rt-danger-700`,
        value: `#9e000c`,
    },
    {
        lead: `    /* Info разведён с маркой намеренно. До этого две палитры стояли на одном тоне —
       262.9° у обеих, — различаясь только цветностью, а ступень 700 совпадала с
       брендовой буквально. Уведомление «к сведению» — статус наравне с успехом и
       опасностью, а не акцент марки: у потребителя с зелёной маркой оно иначе стало
       бы неотличимо от успешного. Тон уведён к 250°: дальше охват sRGB режет
       цветность вдвое, и синий уходит в бирюзу. */`,
        space: true,
        name: `--rt-info-50`,
        value: `#eef6ff`,
    },
    {
        name: `--rt-info-500`,
        value: `#0173c6`,
    },
    {
        name: `--rt-info-600`,
        value: `#005fa5`,
    },
    {
        name: `--rt-info-700`,
        value: `#004c85`,
    },
    {
        lead: `    /* Spacing — ряд с шагом 4px. Промежуточных ступеней в нём нет: 6, 10, 12 и 28
       пикселей стояли ступенями под конкретные места, и выбрать из такого ряда было
       нельзя. Употребления округлены к ближайшей ступени, при равенстве — вверх. */`,
        space: true,
        name: `--rt-space-0`,
        value: `0`,
    },
    {
        name: `--rt-space-0-5`,
        value: `2px`,
    },
    {
        name: `--rt-space-1`,
        value: `4px`,
    },
    {
        name: `--rt-space-2`,
        value: `8px`,
    },
    {
        name: `--rt-space-4`,
        value: `16px`,
    },
    {
        name: `--rt-space-5`,
        value: `20px`,
    },
    {
        name: `--rt-space-6`,
        value: `24px`,
    },
    {
        name: `--rt-space-8`,
        value: `32px`,
    },
    {
        name: `--rt-space-10`,
        value: `40px`,
    },
    {
        name: `--rt-space-12`,
        value: `48px`,
    },
    {
        name: `--rt-space-16`,
        value: `64px`,
    },
    {
        name: `--rt-space-20`,
        value: `80px`,
    },
    {
        name: `--rt-space-24`,
        value: `96px`,
    },
    {
        lead: `    /* Radius */`,
        space: true,
        name: `--rt-radius-none`,
        value: `0`,
    },
    {
        name: `--rt-radius-xs`,
        value: `2px`,
    },
    {
        name: `--rt-radius-sm`,
        value: `4px`,
    },
    {
        name: `--rt-radius-ms`,
        value: `6px`,
    },
    {
        name: `--rt-radius-md`,
        value: `8px`,
    },
    {
        name: `--rt-radius-lg`,
        value: `10px`,
    },
    {
        name: `--rt-radius-xl`,
        value: `15px`,
    },
    {
        name: `--rt-radius-2xl`,
        value: `20px`,
    },
    {
        name: `--rt-radius-full`,
        value: `9999px`,
    },
    {
        lead: `    /* Typography — font-family */

    /* Noto-начертания идут после Montserrat запасными: они подхватывают тайский,
       хангыль и деванагари, которых в основном шрифте нет, и не трогают латиницу
       с кириллицей — браузер берёт из них только недостающие знаки. */`,
        space: true,
        name: `--rt-font-family-sans`,
        value: `'Montserrat', 'Noto Sans Thai', 'Noto Sans KR', 'Noto Sans Devanagari', system-ui, sans-serif`,
    },
    {
        name: `--rt-font-family-mono`,
        value: `'JetBrains Mono', ui-monospace, monospace`,
    },
    {
        lead: `    /* Typography — text size scale */

    /* Ступень ниже 2xs — только для узких экранов: цена в клетке календаря
       набрана неразрывным пробелом и не переносится, поэтому семь колонок
       упираются в ширину строки, а не в отступы */`,
        space: true,
        name: `--rt-text-3xs`,
        value: `9px`,
    },
    {
        name: `--rt-text-2xs`,
        value: `10px`,
    },
    {
        name: `--rt-text-xs`,
        value: `12px`,
    },
    {
        name: `--rt-text-sm`,
        value: `14px`,
    },
    {
        name: `--rt-text-md`,
        value: `16px`,
    },
    {
        name: `--rt-text-lg`,
        value: `18px`,
    },
    {
        name: `--rt-text-xl`,
        value: `20px`,
    },
    {
        name: `--rt-text-2xl`,
        value: `24px`,
    },
    {
        name: `--rt-text-3xl`,
        value: `32px`,
    },
    {
        name: `--rt-text-4xl`,
        value: `40px`,
    },
    {
        lead: `    /* Typography — line-height */`,
        space: true,
        name: `--rt-leading-none`,
        value: `1`,
    },
    {
        name: `--rt-leading-tight`,
        value: `1.2`,
    },
    {
        name: `--rt-leading-snug`,
        value: `1.35`,
    },
    {
        name: `--rt-leading-normal`,
        value: `1.5`,
    },
    {
        name: `--rt-leading-relaxed`,
        value: `1.65`,
    },
    {
        lead: `    /* Typography — font-weight */`,
        space: true,
        name: `--rt-font-weight-regular`,
        value: `400`,
    },
    {
        name: `--rt-font-weight-medium`,
        value: `500`,
    },
    {
        name: `--rt-font-weight-semibold`,
        value: `600`,
    },
    {
        name: `--rt-font-weight-bold`,
        value: `700`,
    },
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
        name: `--rt-overlay-white-4`,
        value: `rgb(255 255 255 / 4%)`,
    },
    {
        name: `--rt-overlay-white-25`,
        value: `rgb(250 250 250 / 25%)`,
        note: `disabled-текст на графите`,
    },
    {
        name: `--rt-overlay-white-40`,
        value: `rgb(250 250 250 / 40%)`,
        note: `muted-текст на графите`,
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

export const light = [
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
        value: `var(--rt-neutral-100)`,
        dark: `var(--rt-charcoal-950)`,
    },
    {
        name: `--rt-color-bg-surface-subtle-2`,
        value: `var(--rt-neutral-200)`,
    },
    {
        name: `--rt-color-bg-hover`,
        value: `var(--rt-neutral-100)`,
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
        value: `var(--rt-neutral-200)`,
        dark: `var(--rt-charcoal-border)`,
    },
    {
        name: `--rt-color-border-strong`,
        value: `var(--rt-neutral-300)`,
        dark: `var(--rt-charcoal-border-strong)`,
    },
    {
        name: `--rt-color-border-subtle`,
        value: `var(--rt-neutral-200)`,
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
        value: `var(--rt-overlay-black-4)`,
        dark: `var(--rt-overlay-white-4)`,
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
        lead: `    /* Radius / spacing / border */`,
        space: true,
        name: `--rt-input-radius`,
        value: `var(--rt-radius-lg)`,
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
    },
    {
        name: `--rt-toggle-color-border`,
        value: `var(--rt-color-border-strong)`,
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
];

export const coarsePointer = [
    {
        name: '--rt-input-font-size',
        value: 'var(--rt-text-md)',
    },
];
