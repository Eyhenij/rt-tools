import { IRtIcon } from '../icon/rt-icon.model';

/**
 * Модель `<rt-toggle-button-group>`: один корневой неймспейс
 * с префиксом `I`. Generic параметр `T` пробрасывается в `Option<T>`.
 */
export namespace IRtToggleButtonGroup {
    /**
     * Размерный тир. Совпадает с `IButton.Size` у `[rtButton]` — общая высота
     * группы соответствует высоте rt-button (sm 30 / md 40 / lg 50px), чтобы
     * сегменты выравнивались с кнопками в одном ряду. Default — `sm`.
     */
    export type Size = 'sm' | 'md' | 'lg';

    /**
     * Описание одного сегмента группы.
     *
     * - `value` — уникальный идентификатор сегмента, эмитится в `valueChange`.
     * - `label` — текстовая подпись (основной контент).
     * - `icon` — опциональная иконка перед лейблом (`<rt-icon>`).
     * - `title` — нативный HTML-title (вместо тултип-директивы).
     */
    export interface Option<T = string> {
        readonly value: T;
        readonly label: string;
        readonly icon?: IRtIcon.Name;
        readonly title?: string;
    }
}
