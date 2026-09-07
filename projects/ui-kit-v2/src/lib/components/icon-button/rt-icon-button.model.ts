/**
 * Модель `<rt-icon-button>`: один корневой неймспейс с префиксом `I`.
 * Внутри — литеральные union-типы для variant / size / shape / type, чтобы:
 *  - использовать как контракт `input()` сигналов компонента;
 *  - переиспользовать в `argTypes` Storybook.
 */

export namespace IRtIconButton {
    /** Семантическая палитра кнопки. */
    export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';

    /** Размер квадрата кнопки. Маппинг на пиксели — в SCSS (`--rt-icon-button-size`). */
    export type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

    /**
     * Форма границы кнопки, от прямых углов к кругу.
     * Промежуточные ступени заданы долей стороны, а не пикселями: кнопка бывает
     * от 32 до 64 пикселей, и на меньшей абсолютный радиус даёт круг раньше срока.
     */
    export type Shape = 'square' | 'rounded-sm' | 'rounded-lg' | 'circle';

    /** HTML-тип нативного `<button>`. */
    export type Type = 'button' | 'submit';
}
