/**
 * Модель `<rt-thread-list>`: один корневой неймспейс с префиксом `I`.
 */
export namespace IRtThreadList {
    /**
     * Минимальный контракт строки списка. Shell читает `id` (трек + активный
     * сегмент + клик) и модификаторы отображения; всё остальное — забота
     * проецируемого row-темплейта потребителя.
     *
     * - `hasUnread` — есть непрочитанные (жирный заголовок + точка).
     * - `overdue` — просрочка (акцент в meta); необязателен, дефолт — нет.
     */
    export interface Row {
        id: number;
        hasUnread: boolean;
        overdue?: boolean;
    }

    /** Контекст row-темплейта: строка приходит как `$implicit` (`let-row`). */
    export interface RowContext<TRow extends Row> {
        $implicit: TRow;
    }
}
