/* Ступени шкалы материального набора — палитра первого кита, перенесённая числами.

   Часть источника свойств оформления — входом остаётся `tokens.source.mjs`, он же собирает
   `scale` из этой части и соседних.

   Зачем своё семейство, а не переопределение ступеней кита: набор — слой назначений, и шкалу
   он не трогает; переписанная ступень перекрасила бы заодно и тёмную тему, которая ссылается
   на те же ступени. Поэтому вид первого кита приезжает своими ступенями, а материальные
   назначения выбирают из них.

   Значения сняты с `projects/ui-kit/src/styles/base/_tokens.scss` — со светлой половины его
   назначений. Ссылок на токены первого кита здесь нет нарочно: приложение, подключившее оба
   кита, получило бы ступень того из них, чей файл подключён позже.

   Ряд ступеней здесь не ровный: он такой же, каким сложился у первого кита, — 0, 5, 10, 15…
   Ровнять его значило бы менять вид, ради переноса которого набор и заводится. */

export const scaleMaterial = [
    {
        lead: `    /* Материальный набор: нейтральный ряд первого кита */`,
        space: true,
        name: `--rt-mat-neutral-0`,
        value: `#fff`,
    },
    { name: `--rt-mat-neutral-5`, value: `#f5f6f8` },
    { name: `--rt-mat-neutral-10`, value: `#f3f3f3` },
    { name: `--rt-mat-neutral-15`, value: `#eee` },
    { name: `--rt-mat-neutral-20`, value: `#e8e8e8` },
    { name: `--rt-mat-neutral-25`, value: `#e0e0e0` },
    { name: `--rt-mat-neutral-30`, value: `#d1d1d1` },
    { name: `--rt-mat-neutral-35`, value: `#ccc` },
    { name: `--rt-mat-neutral-40`, value: `#a3a3a3` },
    { name: `--rt-mat-neutral-60`, value: `#747474` },
    { name: `--rt-mat-neutral-80`, value: `#323033` },
    { name: `--rt-mat-neutral-100`, value: `#181818` },

    {
        lead: `    /* Материальный набор: синий — действие, ссылка, кольцо фокуса */`,
        space: true,
        name: `--rt-mat-blue-20`,
        value: `#eaedfc`,
    },
    { name: `--rt-mat-blue-40`, value: `#b3ceef` },
    { name: `--rt-mat-blue-60`, value: `#6d96e8` },
    { name: `--rt-mat-blue-80`, value: `#4285f4` },
    { name: `--rt-mat-blue-100`, value: `#4284d7` },

    {
        lead: `    /* Материальный набор: красный — опасное действие и ошибка */`,
        space: true,
        name: `--rt-mat-red-10`,
        value: `#fdedee`,
    },
    { name: `--rt-mat-red-20`, value: `#efc0c1` },
    { name: `--rt-mat-red-40`, value: `#f7b9bb` },
    { name: `--rt-mat-red-60`, value: `#e88487` },
    { name: `--rt-mat-red-80`, value: `#df6064` },
    { name: `--rt-mat-red-100`, value: `#eb5055` },

    {
        lead: `    /* Материальный набор: оранжевый — предупреждение */`,
        space: true,
        name: `--rt-mat-orange-5`,
        value: `#f6e4d9`,
    },
    { name: `--rt-mat-orange-10`, value: `#e8cbbf` },
    { name: `--rt-mat-orange-20`, value: `#e1ba9e` },
    { name: `--rt-mat-orange-40`, value: `#e4a985` },
    { name: `--rt-mat-orange-60`, value: `#f1a05d` },
    { name: `--rt-mat-orange-70`, value: `#f2994a` },
    { name: `--rt-mat-orange-80`, value: `#ee7a34` },
    { name: `--rt-mat-orange-100`, value: `#ef7128` },

    {
        lead: `    /* Материальный набор: зелёный — успех */`,
        space: true,
        name: `--rt-mat-green-10`,
        value: `#e5f8f4`,
    },
    { name: `--rt-mat-green-20`, value: `#baf4e0` },
    { name: `--rt-mat-green-40`, value: `#5dbfbc` },
    { name: `--rt-mat-green-60`, value: `#46c4c0` },
    { name: `--rt-mat-green-80`, value: `#21b18e` },
    { name: `--rt-mat-green-100`, value: `#01af8d` },

    {
        lead: `    /* Материальный набор: марка первого кита и подложка его обвязки */`,
        space: true,
        name: `--rt-mat-navy-100`,
        value: `#0d1c2b`,
    },
    {
        lead: `    /* Прозрачные оттенки считаются от своих ступеней, а не повторяют их коды цвета. */`,
        space: true,
        name: `--rt-mat-overlay-black-4`,
        value: `color-mix(in srgb, var(--rt-mat-neutral-100) 4%, transparent)`,
    },
    {
        name: `--rt-mat-overlay-black-32`,
        value: `color-mix(in srgb, var(--rt-mat-neutral-100) 32%, transparent)`,
    },
    {
        name: `--rt-mat-overlay-blue-8`,
        value: `color-mix(in srgb, var(--rt-mat-blue-100) 8%, transparent)`,
    },
    {
        name: `--rt-mat-overlay-blue-24`,
        value: `color-mix(in srgb, var(--rt-mat-blue-100) 24%, transparent)`,
    },
    {
        lead: `    /* Наведение и нажатие первый кит считает от своей ступени тем же приёмом — подмешивая
       чёрное. Ступени здесь считаются так же, а не подбираются на глаз: иначе перекрашенная
       марка перестанет темнеть под курсором вместе с остальным. */`,
        space: true,
        name: `--rt-mat-blue-hover`,
        value: `color-mix(in srgb, var(--rt-mat-blue-100) 90%, #000)`,
    },
    {
        name: `--rt-mat-blue-active`,
        value: `color-mix(in srgb, var(--rt-mat-blue-100) 80%, #000)`,
    },
    {
        name: `--rt-mat-green-hover`,
        value: `color-mix(in srgb, var(--rt-mat-green-80) 90%, #000)`,
    },
    {
        name: `--rt-mat-green-active`,
        value: `color-mix(in srgb, var(--rt-mat-green-80) 80%, #000)`,
    },
    {
        name: `--rt-mat-orange-hover`,
        value: `color-mix(in srgb, var(--rt-mat-orange-80) 90%, #000)`,
    },
    {
        name: `--rt-mat-orange-active`,
        value: `color-mix(in srgb, var(--rt-mat-orange-80) 80%, #000)`,
    },
    {
        name: `--rt-mat-red-hover`,
        value: `color-mix(in srgb, var(--rt-mat-red-100) 90%, #000)`,
    },
    {
        name: `--rt-mat-red-active`,
        value: `color-mix(in srgb, var(--rt-mat-red-100) 80%, #000)`,
    },
    {
        name: `--rt-mat-neutral-hover`,
        value: `color-mix(in srgb, var(--rt-mat-neutral-60) 90%, #000)`,
    },
    {
        name: `--rt-mat-neutral-active`,
        value: `color-mix(in srgb, var(--rt-mat-neutral-60) 80%, #000)`,
    },
];
