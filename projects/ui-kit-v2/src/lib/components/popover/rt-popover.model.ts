/**
 * Модель `[rtPopover]`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtPopover {
    /** Жест, открывающий popover. `manual` — host управляет через open()/close(). */
    export type Trigger = 'click' | 'hover' | 'manual';

    /**
     * Стратегия ширины панели: ровно по host'у (dropdown), не уже host'а и дальше по
     * содержимому (`trigger-min`) или по содержимому целиком (tooltip).
     */
    export type Width = 'trigger' | 'trigger-min' | 'auto';

    /** Горизонтальное выравнивание панели относительно host'а. */
    export type Align = 'start' | 'end';
}
