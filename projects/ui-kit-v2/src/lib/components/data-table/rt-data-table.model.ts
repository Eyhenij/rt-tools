/**
 * Контракты `rt-data-table` — таблицы первого кита во втором, рядом с `rt-table` и вместо неё не
 * встающей.
 *
 * Описание колонки перенесено из первого кита поле в поле, вместе с полями, которых таблица не
 * рисует: экран приложения переезжает без правок описаний колонок и сохранённых настроек,
 * меняются только имена. Значения перечислений те же строки, что в первом ките.
 */
import { FormControl } from '@angular/forms';

import { IFilterModel, ISortModel, TFilterOperatorType } from '@rt-tools/utils';

/** Вид колонки: решает, чем рисуется значение ячейки. */
export enum ERtDataTableColumnType {
    DATE = 'date',
    PERCENT = 'percent',
    ARRAY = 'array',
    BOOLEAN = 'boolean',
    TEXT = 'text',
    CURRENCY = 'currency',
    CUSTOM = 'custom',
}

/** Чем колонка отбирает в строке отбора. */
export enum ERtDataTableFilterType {
    TEXT = 'text',
    NUMBER = 'number',
    SELECT = 'select',
    DATE = 'date',
}

/** Цвет значка ячейки. */
export enum ERtDataTableCellColor {
    NEUTRAL = 'neutral',
    DANGER = 'danger',
    WARNING = 'warning',
    SUCCESS = 'success',
    EMPTY = 'empty',
}

/**
 * Условия отбора таблицы. Ключ — имя свойства колонки, а не ключ записи: отбирают по колонке.
 */
export type TRtDataTableFilters<T> = Array<IFilterModel<Extract<keyof T, string>>>;

export namespace IRtDataTable {
    export type CellColor = `${ERtDataTableCellColor}`;

    export type ColumnType = `${ERtDataTableColumnType}`;

    export type FilterType = `${ERtDataTableFilterType}`;

    export type Align = 'right' | 'left' | 'center';

    export interface Column<T = Record<string, unknown>> extends Record<string, unknown> {
        align: IRtDataTable.Align;
        /* Имя свойства записи, только строковое: им же колонка называет себя строке отбора, а та
           берёт строку — у первого кита имя свойства тоже всегда строка. */
        propName: Extract<keyof T, string>;
        type: IRtDataTable.ColumnType;
        copyable: boolean;
        header: IRtDataTable.Header;

        sorting?: ISortModel<NonNullable<Extract<keyof T, string>>>;
        /** Объявлено первым китом и таблицей не читается; держится ради переезда без правок. */
        filtering?: boolean;
        /** Объявлено первым китом и таблицей не читается; держится ради переезда без правок. */
        filteringMultiple?: boolean;
        copyBtnAlign?: 'right' | 'left';

        width?: string;
        minWidth?: string;

        icon?: IRtDataTable.Icon;
        iconTransform?: (value: T[keyof T]) => string;
        /** Объявлено первым китом и таблицей не читается; держится ради переезда без правок. */
        href?: string;
        /** Объявлено первым китом и таблицей не читается; держится ради переезда без правок. */
        className?: string;
        tooltip?: string;
        transform?: (value: T[keyof T]) => string | number;

        filterType?: IRtDataTable.FilterType;
        defaultFilterOperator?: TFilterOperatorType;
        filterOperators?: TFilterOperatorType[];
        filterSelectOptions?: string[];

        displayName?: string;
        orderIndex?: number;
        hidden?: boolean;
        /** Объявлено первым китом и таблицей не читается; держится ради переезда без правок. */
        fixed?: boolean;
    }

    export interface ColumnFilter {
        propName: string;
        value: string;
    }

    export interface Header {
        align: IRtDataTable.Align;
        label: string;

        className?: string;
        tooltip?: string;
        icon?: IRtDataTable.Icon;
    }

    /**
     * Значок колонки. Имя — имя первого кита; рисует его набор кита через перечень соответствий,
     * а шаблон значка, отданный приложением, рисует его сам.
     */
    export interface Icon {
        glyph: string;

        color?: IRtDataTable.CellColor;
        tooltip?: string;
        visible?: boolean;
        placement?: 'left' | 'right';
        /** Первый кит выбирал им начертание шрифта; набор кита шрифта не берёт, и признак ничего не меняет. */
        outlined?: boolean;
    }

    export namespace Config {
        /** Сохранённые настройки таблицы: та же форма, что у первого кита, — их читает и новое семейство. */
        export interface Data<T> {
            isVerticalScrollbarShown: boolean;
            isHorizontalScrollbarShown: boolean;
            columns: Array<IRtDataTable.Column<T>>;
        }

        export interface Form<T> {
            isVerticalScrollbarShown: FormControl<boolean>;
            isHorizontalScrollbarShown: FormControl<boolean>;
            columns: FormControl<(keyof T)[]>;
        }
    }
}
