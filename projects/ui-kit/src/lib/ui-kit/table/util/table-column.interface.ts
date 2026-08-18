import { FormControl } from '@angular/forms';

import { TFilterOperatorType, ISortModel } from '@rt-tools/utils';

export enum ETableColumnTypes {
    DATE = 'date',
    PERCENT = 'percent',
    ARRAY = 'array',
    BOOLEAN = 'boolean',
    TEXT = 'text',
    CURRENCY = 'currency',
    CUSTOM = 'custom',
}

export enum ETableColumnFilterTypes {
    TEXT = 'text',
    NUMBER = 'number',
    SELECT = 'select',
    DATE = 'date',
}

export enum ETextCellColor {
    NEUTRAL = 'neutral',
    DANGER = 'danger',
    WARNING = 'warning',
    SUCCESS = 'success',
    EMPTY = 'empty',
}

export namespace ITable {
    export type TextCellColor =
        ETextCellColor.NEUTRAL | ETextCellColor.DANGER | ETextCellColor.WARNING | ETextCellColor.SUCCESS | ETextCellColor.EMPTY;

    export type Type =
        | ETableColumnTypes.DATE
        | ETableColumnTypes.PERCENT
        | ETableColumnTypes.ARRAY
        | ETableColumnTypes.BOOLEAN
        | ETableColumnTypes.TEXT
        | ETableColumnTypes.CURRENCY
        | ETableColumnTypes.CUSTOM;

    export type FilterType =
        ETableColumnFilterTypes.TEXT | ETableColumnFilterTypes.NUMBER | ETableColumnFilterTypes.SELECT | ETableColumnFilterTypes.DATE;

    export interface Column<T = Record<string, unknown>> extends Record<string, unknown> {
        align: 'right' | 'left' | 'center';
        propName: keyof T;
        type: Type;
        copyable: boolean;
        header: Header;

        sorting?: ISortModel<NonNullable<Extract<keyof T, string>>>;
        filtering?: boolean;
        filteringMultiple?: boolean;
        copyBtnAlign?: 'right' | 'left';

        width?: string;
        minWidth?: string;

        icon?: Icon;
        iconTransform?: (value: T[keyof T]) => string;
        href?: string;
        className?: string;
        tooltip?: string;
        transform?: (value: T[keyof T]) => string | number;

        // Additional properties for filters
        filterType?: FilterType;
        defaultFilterOperator?: TFilterOperatorType;
        filterOperators?: TFilterOperatorType[];
        filterSelectOptions?: string[];

        // Additional properties for table configuration service
        displayName?: string;
        orderIndex?: number;
        hidden?: boolean;
        fixed?: boolean;
    }

    export interface ColumnFilter {
        propName: string;
        value: string;
    }

    export interface Header {
        align: 'right' | 'left' | 'center';
        label: string;

        className?: string;
        tooltip?: string;
        icon?: Icon;
    }

    export interface Icon {
        glyph: string;

        color?: TextCellColor;
        tooltip?: string;
        visible?: boolean;
        placement?: 'left' | 'right';
        outlined?: boolean;
    }

    export namespace Config {
        export interface Data<T> {
            isVerticalScrollbarShown: boolean;
            isHorizontalScrollbarShown: boolean;
            columns: Array<ITable.Column<T>>;
        }

        export interface Form<T> {
            isVerticalScrollbarShown: FormControl<boolean>;
            isHorizontalScrollbarShown: FormControl<boolean>;
            columns: FormControl<(keyof T)[]>;
        }
    }
}
