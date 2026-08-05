/**
 * Модель `[rtPopover]`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtPopover {
    /** Жест, открывающий popover. `manual` — host управляет через open()/close(). */
    export type Trigger = 'click' | 'hover' | 'manual';

    /** Стратегия ширины панели: по host'у (dropdown) или по контенту (tooltip). */
    export type Width = 'trigger' | 'auto';

    /** Горизонтальное выравнивание панели относительно host'а. */
    export type Align = 'start' | 'end';
}
