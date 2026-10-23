import { IRtIcon } from '@rt-tools/ui-kit-v2/core';

/**
 * Модель `<rt-service-logo>`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtServiceLogo {
    /** Размер круга. Числа — атома «Service Logo»: круг 32 / 40 / 64 / 96, знак 16 / 20 / 32 / 48. */
    export type Size = 'xs' | 'sm' | 'md' | 'lg';

    /** Знак картинкой: адрес даёт приложение, знаков чужих компаний в пакете нет. */
    export interface ImageItem {
        readonly src: string;
        /** Имя службы — его читает экранный диктор. */
        readonly label: string;
    }

    /** Знак значком кита — у способа без своей компании: перевод, наличные. */
    export interface IconItem {
        readonly icon: IRtIcon.Name;
        /** Имя службы — его читает экранный диктор. */
        readonly label: string;
    }

    /** Один знак ряда. */
    export type Item = ImageItem | IconItem;
}
