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
     * Форма границы кнопки, от скруглённого квадрата к кругу.
     * Промежуточные ступени делят расстояние от квадрата до круга на три равные части,
     * а не задаются своей долей стороны: кнопка бывает от 32 до 64 пикселей, а радиус
     * квадрата на всех один — доля, взятая сама по себе, сливается с ним на одних
     * размерах и отрывается на других.
     */
    export type Shape = 'square' | 'rounded-sm' | 'rounded-lg' | 'circle';

    /** HTML-тип нативного `<button>`. */
    export type Type = 'button' | 'submit';
}
