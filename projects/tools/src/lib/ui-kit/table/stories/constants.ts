import { LIST_SORT_ORDER_ENUM } from '../util/list-sort-order.enum';
import { ITable, TABLE_COLUMN_TYPES_ENUM, TEXT_CELL_COLOR_ENUM } from '../util/table-column.interface';
import { Person, ResponsiblePerson } from './types';

export const COLUMNS: Array<ITable.Column<Person>> = [
    {
        align: 'left',
        propName: 'id',
        type: TABLE_COLUMN_TYPES_ENUM.TEXT,
        copyable: true,
        header: {
            align: 'left',
            label: 'ID',
            icon: {
                glyph: 'priority_high',
                color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
                placement: 'left',
            },
        },
        sorting: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        width: '100px',
        icon: {
            glyph: 'priority_high',
            color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
            placement: 'right',
        },
    },
    {
        align: 'left',
        propName: 'name',
        type: TABLE_COLUMN_TYPES_ENUM.TEXT,
        copyable: true,
        header: {
            align: 'left',
            label: 'Name',
            icon: {
                glyph: 'info',
                color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
                placement: 'right',
            },
        },
        sorting: {
            propertyName: 'name',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        width: '150px',
        icon: {
            glyph: 'priority_high',
            color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
            placement: 'right',
        },
    },
    {
        align: 'left',
        propName: 'email',
        type: TABLE_COLUMN_TYPES_ENUM.TEXT,
        copyable: true,
        header: {
            align: 'left',
            label: 'Email',
            icon: {
                glyph: 'email',
                color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
                placement: 'left',
            },
        },
        sorting: {
            propertyName: 'email',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        width: '200px',
        icon: {
            glyph: 'priority_high',
            color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
            placement: 'left',
        },
    },
    {
        align: 'right',
        propName: 'age',
        type: TABLE_COLUMN_TYPES_ENUM.TEXT,
        copyable: false,
        header: {
            align: 'right',
            label: 'Age',
        },
        sorting: {
            propertyName: 'age',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        icon: {
            glyph: 'priority_high',
            color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
            placement: 'left',
        },
    },
    {
        align: 'left',
        propName: 'sex',
        type: TABLE_COLUMN_TYPES_ENUM.TEXT,
        copyable: false,
        header: {
            align: 'left',
            label: 'Sex',
            icon: {
                glyph: 'wc',
                color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
                placement: 'left',
            },
        },
        sorting: {
            propertyName: 'sex',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        width: '100px',
    },
    {
        align: 'left',
        propName: 'bio',
        type: TABLE_COLUMN_TYPES_ENUM.TEXT,
        copyable: false,
        header: {
            align: 'left',
            label: 'Bio',
        },
        width: '300px',
    },
    {
        align: 'right',
        propName: 'bill',
        type: TABLE_COLUMN_TYPES_ENUM.CURRENCY,
        copyable: false,
        header: {
            align: 'right',
            label: 'Bill',
        },
        sorting: {
            propertyName: 'bill',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        width: '100px',
    },
    {
        align: 'left',
        propName: 'birthdate',
        type: TABLE_COLUMN_TYPES_ENUM.DATE,
        copyable: false,
        header: {
            align: 'left',
            label: 'Birthdate',
        },
        sorting: {
            propertyName: 'birthdate',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        width: '150px',
    },
    {
        align: 'left',
        propName: 'items',
        type: TABLE_COLUMN_TYPES_ENUM.ARRAY,
        copyable: false,
        header: {
            align: 'left',
            label: 'Items',
        },
        width: '200px',
    },
    {
        align: 'left',
        propName: 'responsible',
        type: TABLE_COLUMN_TYPES_ENUM.TEXT,
        copyable: false,
        header: {
            align: 'left',
            label: 'Responsible Person',
        },
        transform: (value: ResponsiblePerson) => `${value.name.firstname} ${value.name.lastname}`,
        width: '200px',
    },
];
