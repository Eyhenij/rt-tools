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
    export type Size = 'sm' | 'md' | 'lg';

    /** Форма границы кнопки. */
    export type Shape = 'circle' | 'square';

    /** HTML-тип нативного `<button>`. */
    export type Type = 'button' | 'submit';
}
