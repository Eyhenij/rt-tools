/**
 * Контракты `rt-menu` — dropdown-меню действий (триггер «…» + плавающая панель
 * с пунктами `rt-menu-item`). Один корневой неймспейс с префиксом `I`.
 */
export namespace IRtMenu {
    /** Горизонтальное выравнивание панели относительно триггера. */
    export type Align = 'start' | 'end';

    /** Тон подтверждающей кнопки в confirm-модалке пункта меню. */
    export type ConfirmTone = 'danger' | 'warning' | 'primary';

    /**
     * Данные для confirm-модалки, которую `rt-menu-item` открывает перед
     * деструктивным действием. Прокидываются в `rt-menu-confirm-dialog` через
     * `RT_DIALOG_DATA`; модалка возвращает `true` при подтверждении.
     */
    export interface ConfirmData {
        readonly message: string;
        readonly title: string | null;
        readonly confirmLabel: string;
        readonly cancelLabel: string;
        readonly tone: ConfirmTone;
    }
}

/**
 * Имя DOM-события, которое `rt-menu-item` всплывающе диспатчит при выборе пункта.
 * `rt-menu` слушает его на панели и закрывается. DOM-событие (а не DI/output)
 * нужно потому, что пункты проецируются в overlay-панель — всплытие через DOM
 * переживает границы content-projection и overlay-контейнера.
 */
export const RT_MENU_SELECT_EVENT: string = 'rtMenuSelect';
