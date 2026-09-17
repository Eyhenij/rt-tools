/**
 * Контракты `rt-table` — стилизованная обёртка над `cdk-table` из `@angular/cdk/table`.
 * Один корневой неймспейс с префиксом `I`.
 *
 * Сама декларация колонок (`cdkColumnDef`, `*cdkHeaderCellDef`, `*cdkCellDef`) и
 * строк (`*cdkHeaderRowDef`, `*cdkRowDef`) живёт на стороне consumer'а — пишется
 * в шаблоне через template-projection. rt-table даёт визуальный treatment
 * (border 1px, height 50px, padding 16px 20px, hover-строка, `density`).
 */
import { TFilterOperatorType } from '@rt-tools/utils';

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
        /** Чем колонка отбирает. Без этого поля отбора у колонки нет вовсе. */
        filter?: IRtTable.ColumnFilter;
    }

    /** Каким видом колонка отбирает: вид решает, какую готовую часть кита позовёт шапка. */
    export type FilterKind = 'text' | 'number' | 'select' | 'date';

    /**
     * Чем колонка отбирает. Вид объявляет колонка, а не угадывает значение: догадка по значению
     * читает пустую колонку как текст, и колонка получает сравнение, которого не обещала.
     *
     * `operators` — те виды сравнения, которые колонка разрешает; `startOperator` — тот, с
     * которого она начинает. `options` нужны только виду `select`.
     */
    export interface ColumnFilter {
        kind: IRtTable.FilterKind;
        operators?: readonly TFilterOperatorType[];
        startOperator?: TFilterOperatorType;
        options?: readonly IRtTable.FilterOption[];
    }

    /** Один вариант выбора для отбора вида `select`. */
    export interface FilterOption {
        value: string | number;
        label: string;
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
