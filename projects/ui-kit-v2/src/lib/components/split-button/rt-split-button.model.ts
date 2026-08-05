import { IButton } from '../button/rt-button.model';

/**
 * Модель `rt-split-button`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtSplitButton {
    /** Пункт выпадающего меню второстепенных действий. */
    export interface MenuItem {
        /** Машинный ключ — эмитится в `(itemSelect)` при выборе пункта. */
        value: string;
        /** Видимая подпись пункта. */
        label: string;
        /** Опциональная иконка слева от подписи. */
        icon?: string;
        /** Пункт заблокирован (не кликабелен). */
        disabled?: boolean;
    }

    /** Палитра — подмножество темы `[rtButton]` (общий вид лица и каретки). */
    export type Theme = IButton.Theme;

    /** Размер — как у `[rtButton]`. */
    export type Size = IButton.Size;
}
