import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

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
     * - `glyph` — имя Material вместо `icon`; рисуется так же, как вход `glyph` у `rt-icon`.
     * - `title` — нативный HTML-title (вместо тултип-директивы).
     * - `disabled` — сегмент недоступен сейчас: он остаётся видимым, но нажатия не пропускает.
     *   Признак лежит рядом с подписью, а не отдельным списком значений: список запретов
     *   расходится с самим списком сегментов молча — в нём остаётся значение, которого в группе
     *   уже нет.
     */
    export interface Option<T = string> {
        readonly value: T;
        readonly label: string;
        readonly icon?: IRtIcon.Name;
        readonly glyph?: string;
        readonly title?: string;
        readonly disabled?: boolean;
    }

    /**
     * Сегмент, готовый к отрисовке: подсветка и недоступность посчитаны компонентом.
     *
     * Заведён затем, чтобы шаблон не считал ни того, ни другого: подсветка читается по-разному в
     * одиночном и множественном выборе, а недоступность приходит с двух сторон — от группы и от
     * самого сегмента.
     */
    export interface Rendered<T = string> {
        readonly option: Option<T>;
        readonly active: boolean;
        readonly disabled: boolean;
        readonly context: OptionContext<T>;
    }

    /** Обстановка шаблона сегмента: опция приходит как `$implicit`. */
    export interface OptionContext<T = string> {
        readonly $implicit: Option<T>;
        /** Нажат ли сегмент. */
        readonly active: boolean;
    }

    /**
     * Раскладка сегментов. `row` — одна строка, как прежде; `wrap` — сегменты, не влезшие в строку,
     * уходят на следующую; `column` — сегменты стоят один под другим.
     */
    export type Layout = 'row' | 'wrap' | 'column';

    /**
     * Вид группы. `segmented` — дорожка с сегментами, выбранный светлее дорожки; `chips` — отдельные
     * пункты с обводкой и просветом между ними, выбранный залит. Поведение у обоих одно: выбор,
     * множественный выбор, раскладка и связь с формой от вида не зависят.
     */
    export type Appearance = 'segmented' | 'chips';

    /** Значение, которое группа пишет в форму: одно при одиночном выборе, набор — при множественном. */
    export type FormValue<T = string> = T | ReadonlyArray<T> | null | undefined;
}
