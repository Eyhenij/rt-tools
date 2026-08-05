/**
 * Контракты `rt-tag` — status pill компонент.
 * Один корневой неймспейс с префиксом `I`, внутри литеральные union'ы
 * для severity / shape, используемые как контракт `input()` сигналов компонента
 * и в `argTypes` Storybook.
 */
export namespace IRtTag {
    /** Семантическая палитра tag'а: 6 нормализованных членов (warn/contrast объединены в warning/secondary). */
    export type Severity = 'info' | 'success' | 'warning' | 'danger' | 'secondary' | 'neutral';

    /** Форма tag'а: pill (rounded) или square (small radius). */
    export type Shape = 'pill' | 'square';

    /** Вид заливки: solid (фон палитры) или outlined (прозрачный фон + рамка цвета палитры). */
    export type Appearance = 'solid' | 'outlined';

    /**
     * Явное скругление углов поверх `shape`. `null` (дефолт) — радиус берётся
     * из `shape`; заданное значение переопределяет. Значения — подмножество
     * шкалы `--rt-radius-*`.
     */
    export type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full';
}
