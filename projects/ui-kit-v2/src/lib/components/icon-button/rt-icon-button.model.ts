/**
 * Модель `<rt-icon-button>`: один корневой неймспейс с префиксом `I`.
 * Внутри — литеральные union-типы для variant / size / type, чтобы:
 *  - использовать как контракт `input()` сигналов компонента;
 *  - переиспользовать в `argTypes` Storybook.
 */

export namespace IRtIconButton {
    /** Семантическая палитра кнопки. */
    export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';

    /**
     * Размер квадрата кнопки. Шаги — в SCSS; `xs` — 22px и `2xs` — 20px, оба со значком 16px.
     * Свой размер задаёт `--rt-icon-button-size` на теге или выше.
     */
    export type Size = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

    /** HTML-тип нативного `<button>`. */
    export type Type = 'button' | 'submit';
}
