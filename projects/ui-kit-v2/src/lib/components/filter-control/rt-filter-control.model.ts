import { IRtIcon } from '../icon/rt-icon.model';

/**
 * Модель `<rt-filter-control>`: один корневой неймспейс с
 * префиксом `I`. Форма опции повторяет `IRtToggleButtonGroup.Option`, поэтому
 * существующие массивы фильтров присваиваются структурно, без кастов. Generic
 * `T` пробрасывается в `Option<T>`.
 */
export namespace IRtFilterControl {
    /** Размерный тир — совпадает с rt-toggle-button-group / rt-select. */
    export type Size = 'sm' | 'md' | 'lg';

    /**
     * Описание одной опции фильтра.
     *
     * - `value` — эмитится в `valueChange`.
     * - `label` — текстовая подпись.
     * - `icon` / `title` — используются только сегментами (десктоп); rt-select
     *   в узком режиме их игнорирует.
     */
    export interface Option<T = string> {
        readonly value: T;
        readonly label: string;
        readonly icon?: IRtIcon.Name;
        readonly title?: string;
    }
}
