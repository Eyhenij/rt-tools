/**
 * Контракты `rt-table` — стилизованная обёртка над `cdk-table` из `@angular/cdk/table`.
 * Один корневой неймспейс с префиксом `I`.
 *
 * Сама декларация колонок (`cdkColumnDef`, `*cdkHeaderCellDef`, `*cdkCellDef`) и
 * строк (`*cdkHeaderRowDef`, `*cdkRowDef`) живёт на стороне consumer'а — пишется
 * в шаблоне через template-projection. rt-table даёт визуальный treatment
 * (border 1px, height 50px, padding 16px 20px, hover-строка, `density`).
 */
export namespace IRtTable {
    /** Плотность таблицы — модификатор `rt-table--density--<value>`. */
    export type Density = 'default' | 'compact';

    /**
     * Есть ли у строки хотя бы одно доступное действие. Заполняется экраном тем же
     * признаком, которым он гейтит сами пункты меню.
     */
    export type RowActionsPredicate<TRow> = (row: TRow) => boolean;

    /**
     * Метаданные колонки для настраиваемых таблиц (панель настроек: видимость + порядок).
     * `key` совпадает с `cdkColumnDef` и именем в `displayedColumns`. Порядок по умолчанию —
     * позиция в массиве `[columnsConfig]`.
     */
    export interface ColumnConfig {
        key: string;
        label: string;
        /** Скрыта по умолчанию (пользователь может показать в панели). Default false. */
        hidden?: boolean;
        /** Нельзя скрыть/переместить — всегда видима на своём месте. Default false. */
        locked?: boolean;
        /** Заголовок колонки переключает порядок строк. Default false. */
        sortable?: boolean;
    }

    /** Текущее состояние настроек колонок (порядок ключей + скрытые ключи), применяемое к рендеру. */
    export interface ColumnSettings {
        order: string[];
        hidden: string[];
    }

    /** Строка списка в панели настроек: конфиг колонки + разрешённое «скрыта». */
    export interface ColumnSettingItem extends ColumnConfig {
        hidden: boolean;
    }
}
