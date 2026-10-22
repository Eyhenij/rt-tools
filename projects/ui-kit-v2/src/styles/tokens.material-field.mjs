/* Материальный набор: поле Material — обведённое и залитое, его размер, цвета подписи и значков,
   отключённое поле, крестик очистки, звёздочка и строка под полем.

   Часть материального набора — входом остаётся `tokens.material.mjs`, порядок назначений тот же. */

export const materialField = [
    {
        lead: `    /* Обведённое поле Material: прозрачное, рамка цвета outline темы, фокус — рамка в два
       пикселя цветом марки без внешнего кольца. Вторая линия рамки фокуса — внутренняя тень. */`,
        space: true,
        name: `--rt-input-color-bg`,
        value: `transparent`,
    },
    { name: `--rt-input-color-border`, value: `var(--rt-sys-outline, var(--rt-mat-neutral-60))` },
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
        value: `var(--rt-sys-on-surface-variant, var(--rt-mat-neutral-60))`,
    },
    {
        name: `--rt-input-icon-color`,
        value: `var(--rt-sys-on-surface-variant, var(--rt-neutral-600))`,
        dark: `var(--rt-sys-on-surface-variant, var(--rt-neutral-600))`,
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
        lead: `    /* Крестик очистки — крестик первого кита: 19 px, значок 12 px, серый, в 8 px от края поля и в
       4 px от текста. Отступ от края считается от правого поля в 4 px, как у поля Material с крестиком. */`,
        space: true,
        name: `--rt-input-clear-size`,
        value: `19px`,
    },
    { name: `--rt-input-clear-icon-size`, value: `var(--rt-size-3)` },
    { name: `--rt-input-clear-color`, value: `var(--rt-mat-neutral-60)`, dark: `var(--rt-mat-neutral-40)` },
    { name: `--rt-input-clear-offset-end`, value: `calc(var(--rt-space-2) - var(--rt-space-1))` },
    { name: `--rt-input-clear-offset-start`, value: `calc(var(--rt-space-1) - var(--rt-input-gap))` },
    {
        name: `--rt-input-fill-color-bg-disabled`,
        value: `color-mix(in srgb, var(--rt-sys-on-surface, var(--rt-mat-neutral-100)) 4%, transparent)`,
        dark: `color-mix(in srgb, var(--rt-sys-on-surface, var(--rt-mat-neutral-0)) 4%, transparent)`,
    },
    { name: `--rt-input-clear-bg`, value: `var(--rt-mat-neutral-25)`, dark: `var(--rt-mat-neutral-70)` },
    { name: `--rt-input-clear-bg-hover`, value: `var(--rt-input-clear-bg)`, dark: `var(--rt-input-clear-bg)` },
    { name: `--rt-input-clear-radius`, value: `var(--rt-radius-full)` },
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
    {
        lead: `    /* Строка под полем — строка подсказки Material: 16 px высотой и 4 px над ней. */`,
        space: true,
        name: `--rt-field-messages-line-height`,
        value: `var(--rt-size-4)`,
    },
    { name: `--rt-field-messages-padding-top`, value: `var(--rt-space-1)` },
];
