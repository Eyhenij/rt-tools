import { iconsName } from './rt-icon-names';

/**
 * Модель `<rt-icon>`: один корневой неймспейс с префиксом `I`.
 * Внутри — подтипы для имён/размеров/цветов компонента.
 */

export namespace IRtIcon {
    /** Допустимые имена иконок. Литеральный union из {@link iconsName}. */
    export type Name = (typeof iconsName)[number];

    /** Доступные размеры. Маппинг на пиксели — в `rt-icon.component.ts`. */
    export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

    /** Семантические цвета. Маппинг на CSS-переменные `--rt-icon-color-*` — в `rt-icon.component.ts`. */
    export type Color = 'current' | 'muted' | 'info' | 'success' | 'warning' | 'danger' | 'inverse';
}
