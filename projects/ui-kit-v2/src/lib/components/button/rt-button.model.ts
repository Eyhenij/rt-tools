/**
 * Типы и варианты для директивы `[rtButton]`.
 *
 * Собственный `rt-button` без внешних зависимостей — палитра определяется
 * CSS-переменными `--rt-color-*` в стилях либы.
 */
export namespace IButton {
    /** Семантическая палитра. По умолчанию — `primary`. */
    export type Theme = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

    /** Внешний вид: filled (заливка), outlined (контур), text (без фона). */
    export type Appearance = 'filled' | 'outlined' | 'text';

    /** Размер по высоте: sm — 30px, md — 40px (default), lg — 50px. */
    export type Size = 'sm' | 'md' | 'lg';

    /** Положение иконки относительно лейбла. */
    export type IconPos = 'left' | 'right';
}
