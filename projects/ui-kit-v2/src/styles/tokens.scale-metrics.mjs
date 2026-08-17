/* Ступени шкалы: размеры набора. Отступы, скругления и типографика — гарнитура, кегль,
   межстрочное и насыщенность.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`. */

export const scaleMetrics = [
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
];
