export namespace IRtBadge {
    /** Значение пузырька: число или короткая строка; `null` — пузырька нет. */
    export type Value = string | number | null;

    /** Что принимает вход: необязательное поле данных приходит `undefined`, и это тоже «нет». */
    export type ValueInput = Value | undefined;

    /** Угол хоста, у которого стоит пузырёк: сверху или снизу, после или до содержимого. */
    export type Position = 'above-after' | 'above-before' | 'below-after' | 'below-before';

    /** Ступень размера: `sm` — точка под короткое число, `md` — умолчание. */
    export type Size = 'sm' | 'md';

    /** Цвет пузырька — заливка кнопочной палитры и её цвет текста. */
    export type Color = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger';
}
