import { LIST_SORT_ORDER_ENUM } from '../util/list-sort-order.enum';
import { ITable, TABLE_COLUMN_FILTER_TYPES_ENUM, TABLE_COLUMN_TYPES_ENUM, TEXT_CELL_COLOR_ENUM } from '../util/table-column.interface';
import { Person, ResponsiblePerson } from './types';
import { FILTER_OPERATOR_TYPE_ENUM } from '../util';

export const COLUMNS: Array<ITable.Column<Person>> = [
    {
        align: 'left',
        propName: 'id',
        type: TABLE_COLUMN_TYPES_ENUM.TEXT,
        copyable: true,
        header: {
            align: 'left',
            label: 'ID',
        },
        sorting: {
            propertyName: 'id',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        width: '100px',
        minWidth: '100px',
        hidden: true,
    },
    {
        align: 'left',
        propName: 'button',
        type: TABLE_COLUMN_TYPES_ENUM.CUSTOM,
        copyable: false,
        header: {
            align: 'left',
            label: 'Button',
        },
        width: '100px',
        minWidth: '100px',
    },
    {
        align: 'left',
        propName: 'active',
        type: TABLE_COLUMN_TYPES_ENUM.CUSTOM,
        copyable: false,
        header: {
            align: 'left',
            label: 'Active',
        },
        width: '100px',
        minWidth: '100px',
    },
    {
        align: 'left',
        propName: 'image',
        type: TABLE_COLUMN_TYPES_ENUM.CUSTOM,
        copyable: false,
        header: {
            align: 'left',
            label: 'Image',
        },
        width: '100px',
        minWidth: '100px',
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
        icon: {
            glyph: 'priority_high',
            color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
            placement: 'right',
        },
        iconTransform: (): string => {
            return 'font-size: 1rem; width: 1rem; height: 1rem';
        },
        width: '200px',
        minWidth: '200px',
        filterType: TABLE_COLUMN_FILTER_TYPES_ENUM.TEXT,
        filterOperators: [FILTER_OPERATOR_TYPE_ENUM.EQUALS, FILTER_OPERATOR_TYPE_ENUM.NOT_EQUALS, FILTER_OPERATOR_TYPE_ENUM.CONTAINS],
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
        icon: {
            glyph: 'priority_high',
            color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
            placement: 'left',
        },
        width: '200px',
        minWidth: '200px',
        filterType: TABLE_COLUMN_FILTER_TYPES_ENUM.TEXT,
        filterOperators: [FILTER_OPERATOR_TYPE_ENUM.EQUALS, FILTER_OPERATOR_TYPE_ENUM.NOT_EQUALS, FILTER_OPERATOR_TYPE_ENUM.CONTAINS],
    },
    {
        align: 'left',
        propName: 'status',
        type: TABLE_COLUMN_TYPES_ENUM.TEXT,
        copyable: false,
        header: {
            align: 'left',
            label: 'Status',
        },
        sorting: {
            propertyName: 'status',
            sortDirection: LIST_SORT_ORDER_ENUM.ASC,
        },
        icon: {
            glyph: 'circle',
            color: TEXT_CELL_COLOR_ENUM.NEUTRAL,
            placement: 'left',
        },
        iconTransform: (value: Person[keyof Person]): string => {
            let style: string = '';

            switch (value) {
                case 'active':
                    style = 'color: green;';
                    break;
                case 'inactive':
                    style = 'color: orange;';
                    break;
                case 'invited':
                    style = 'color: lightblue;';
                    break;
                case 'deleted':
                    style = 'color: red;';
                    break;
                default:
                    style = `color: ${TEXT_CELL_COLOR_ENUM.NEUTRAL}`;
                    break;
            }

            style += 'font-size: 0.5rem; width: 0.5rem; height: 0.5rem';

            return style;
        },
        minWidth: '120px',
        filterType: TABLE_COLUMN_FILTER_TYPES_ENUM.SELECT,
        filterSelectOptions: ['active', 'inactive', 'invited', 'deleted'],
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
        width: '150px',
        minWidth: '100px',
        filterType: TABLE_COLUMN_FILTER_TYPES_ENUM.NUMBER,
        filterOperators: [
            FILTER_OPERATOR_TYPE_ENUM.EQUALS,
            FILTER_OPERATOR_TYPE_ENUM.NOT_EQUALS,
            FILTER_OPERATOR_TYPE_ENUM.CONTAINS,
            FILTER_OPERATOR_TYPE_ENUM.GREATER_THAN,
            FILTER_OPERATOR_TYPE_ENUM.LESS_THAN,
        ],
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
        minWidth: '100px',
        filterType: TABLE_COLUMN_FILTER_TYPES_ENUM.DATE,
        filterOperators: [
            FILTER_OPERATOR_TYPE_ENUM.EQUALS,
            FILTER_OPERATOR_TYPE_ENUM.NOT_EQUALS,
            FILTER_OPERATOR_TYPE_ENUM.GREATER_THAN,
            FILTER_OPERATOR_TYPE_ENUM.LESS_THAN,
        ],
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
        width: '150px',
        minWidth: '100px',
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
        width: '200px',
        minWidth: '150px',
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
        width: '150px',
        minWidth: '100px',
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
        width: '300px',
        minWidth: '200px',
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
        transform: (value: Person[keyof Person]): string => {
            const name: { firstname: string; lastname: string } = (value as ResponsiblePerson).name;
            return `${name.firstname} ${name.lastname}`;
        },
        width: '150px',
        minWidth: '100px',
    },
];
