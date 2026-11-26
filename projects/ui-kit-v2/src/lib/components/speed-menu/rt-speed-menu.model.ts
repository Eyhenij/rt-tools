import { IRtIconButton } from '@rt-tools/ui-kit-v2/icon-button';

/**
 * Модель `<rt-speed-menu>`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtSpeedMenu {
    /** Сторона кнопки, на которую раскрываются действия. `start` и `end` следуют направлению письма. */
    export type Direction = 'up' | 'down' | 'start' | 'end';

    /** Размер кнопки меню; действия на шаг меньше. */
    export type Size = 'sm' | 'md' | 'lg' | 'xl';

    /** Палитра кнопки меню. */
    export type Variant = IRtIconButton.Variant;

    /** Одно действие меню. */
    export interface Action {
        /** Что уходит выходом `actionSelect` при выборе. */
        value: string;
        /** Значок действия: имя кита рисуется рисунком, другое — лигатурой шрифта Material. */
        icon: string;
        /** Имя действия: подсказка и доступное имя кнопки. */
        label: string;
        /** Недоступное действие видно, но не нажимается. */
        disabled?: boolean;
    }
}
