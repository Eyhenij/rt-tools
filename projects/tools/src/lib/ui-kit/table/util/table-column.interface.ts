import { FormControl } from '@angular/forms';

import { SortModel } from './lists.interface';

export enum TABLE_COLUMN_TYPES_ENUM {
    DATE = 'date',
    PERCENT = 'percent',
    ARRAY = 'array',
    BOOLEAN = 'boolean',
    TEXT = 'text',
    CURRENCY = 'currency',
    CUSTOM = 'custom',
}

export enum TEXT_CELL_COLOR_ENUM {
    NEUTRAL = 'neutral',
    DANGER = 'danger',
    WARNING = 'warning',
    SUCCESS = 'success',
    EMPTY = 'empty',
}

export namespace ITable {
    export type TextCellColor =
        | TEXT_CELL_COLOR_ENUM.NEUTRAL
        | TEXT_CELL_COLOR_ENUM.DANGER
        | TEXT_CELL_COLOR_ENUM.WARNING
        | TEXT_CELL_COLOR_ENUM.SUCCESS
        | TEXT_CELL_COLOR_ENUM.EMPTY;

    export type Type =
        | TABLE_COLUMN_TYPES_ENUM.DATE
        | TABLE_COLUMN_TYPES_ENUM.PERCENT
        | TABLE_COLUMN_TYPES_ENUM.ARRAY
        | TABLE_COLUMN_TYPES_ENUM.BOOLEAN
        | TABLE_COLUMN_TYPES_ENUM.TEXT
        | TABLE_COLUMN_TYPES_ENUM.CURRENCY
        | TABLE_COLUMN_TYPES_ENUM.CUSTOM;

    export interface Column<T = Record<string, unknown>> extends Record<string, unknown> {
        align: 'right' | 'left' | 'center';
        propName: keyof T;
        type: Type;
        copyable: boolean;
        header: Header;

        sorting?: SortModel<NonNullable<Extract<keyof T, string>>>;
        filtering?: boolean;
        filteringMultiple?: boolean;

        width?: string;
        minWidth?: string;

        icon?: Icon;
        iconTransform?: (value: T[keyof T]) => string;
        href?: string;
        className?: string;
        tooltip?: string;
        transform?: (value: T[keyof T]) => string | number;

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
