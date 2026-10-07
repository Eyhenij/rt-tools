import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

/**
 * Модель `<rt-tabs>`: один корневой неймспейс с префиксом `I`.
 * Содержит публичные union-типы для ориентации и стороны header-контролов.
 */
export namespace IRtTabs {
    /** Идентификатор вкладки. Строка — стабильный id, число — индекс-подобный ключ. */
    export type Id = string | number;

    /** Ориентация полосы вкладок. */
    export type Direction = 'horizontal' | 'vertical';

    /** Сторона размещения header-контрола относительно полосы вкладок. */
    export type ControlSide = 'left' | 'right';

    /** Семантический цвет иконки/бейджа вкладки — маппится на палитру `rt-icon`. */
    export type TitleColor = IRtIcon.Color;
}
