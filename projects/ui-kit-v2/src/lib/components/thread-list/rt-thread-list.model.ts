/**
 * Модель `<rt-thread-list>`: один корневой неймспейс с префиксом `I`.
 */
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { IRtServiceLogo } from '@rt-tools/ui-kit-v2/service-logo';

export namespace IRtThreadList {
    /** Номер строки: список ведёт записи и с числовым ключом, и со строковым. */
    export type TRowId = number | string;

    /**
     * Минимальный контракт строки списка. Shell читает `id` (трек + активный
     * сегмент + клик) и модификаторы отображения; всё остальное — забота
     * проецируемого row-темплейта потребителя.
     *
     * - `hasUnread` — есть непрочитанные (жирный заголовок + точка).
     * - `overdue` — просрочка (акцент в meta); необязателен, дефолт — нет.
     * - `sign` — знак канала разговора (сайт, мессенджер): круг `rt-service-logo` размера `xs`
     *   слева от содержимого строки; необязателен, без него строка прежняя.
     */
    export interface Row {
        id: TRowId;
        hasUnread: boolean;
        overdue?: boolean;
        sign?: IRtServiceLogo.Item;
    }

    /** Контекст row-темплейта: строка приходит как `$implicit` (`let-row`). */
    export interface RowContext<TRow extends Row> {
        $implicit: TRow;
    }

    /** Декоративная строка-превью пустого состояния. */
    export interface PreviewRow {
        id: number;
        icon: IRtIcon.Name;
        offset: boolean;
    }
}
