import { EFilterOperatorType, EListSortOrder } from '@rt-tools/utils';
import { ITable, ETableColumnFilterTypes, ETableColumnTypes, ETextCellColor } from '../util/table-column.interface';
import { TPerson, TResponsiblePerson } from './types';

export const COLUMNS: Array<ITable.Column<TPerson>> = [
    {
        align: 'left',
        propName: 'id',
        type: ETableColumnTypes.TEXT,
        copyable: true,
        header: {
            align: 'left',
            label: 'ID',
        },
        sorting: {
            propertyName: 'id',
            sortDirection: EListSortOrder.ASC,
        },
        width: '100px',
        minWidth: '100px',
        hidden: true,
    },
    {
        align: 'left',
        propName: 'button',
        type: ETableColumnTypes.CUSTOM,
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
        type: ETableColumnTypes.CUSTOM,
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
        type: ETableColumnTypes.CUSTOM,
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
        type: ETableColumnTypes.TEXT,
        copyable: true,
        header: {
            align: 'left',
            label: 'Name',
            icon: {
                glyph: 'info',
                color: ETextCellColor.NEUTRAL,
                placement: 'right',
            },
        },
        sorting: {
            propertyName: 'name',
            sortDirection: EListSortOrder.ASC,
        },
        icon: {
            glyph: 'priority_high',
            color: ETextCellColor.NEUTRAL,
            placement: 'right',
        },
        iconTransform: (): string => 'font-size: 1rem; width: 1rem; height: 1rem',
        width: '200px',
        minWidth: '200px',
        filterType: ETableColumnFilterTypes.TEXT,
        filterOperators: [EFilterOperatorType.EQUALS, EFilterOperatorType.NOT_EQUALS, EFilterOperatorType.CONTAINS],
    },
    {
        align: 'left',
        propName: 'email',
        type: ETableColumnTypes.TEXT,
        copyable: true,
        header: {
            align: 'left',
            label: 'Email',
            icon: {
                glyph: 'email',
                color: ETextCellColor.NEUTRAL,
                placement: 'left',
            },
        },
        sorting: {
            propertyName: 'email',
            sortDirection: EListSortOrder.ASC,
        },
        icon: {
            glyph: 'priority_high',
            color: ETextCellColor.NEUTRAL,
            placement: 'left',
        },
        width: '200px',
        minWidth: '200px',
        filterType: ETableColumnFilterTypes.TEXT,
        filterOperators: [EFilterOperatorType.EQUALS, EFilterOperatorType.NOT_EQUALS, EFilterOperatorType.CONTAINS],
    },
    {
        align: 'left',
        propName: 'status',
        type: ETableColumnTypes.TEXT,
        copyable: false,
        header: {
            align: 'left',
            label: 'Status',
        },
        sorting: {
            propertyName: 'status',
            sortDirection: EListSortOrder.ASC,
        },
        icon: {
            glyph: 'circle',
            color: ETextCellColor.NEUTRAL,
            placement: 'left',
        },
        iconTransform: (value: TPerson[keyof TPerson]): string => {
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
                    style = `color: ${ETextCellColor.NEUTRAL}`;
                    break;
            }

            style += 'font-size: 0.5rem; width: 0.5rem; height: 0.5rem';

            return style;
        },
        minWidth: '120px',
        filterType: ETableColumnFilterTypes.SELECT,
        filterSelectOptions: ['active', 'inactive', 'invited', 'deleted'],
    },
    {
        align: 'right',
        propName: 'age',
        type: ETableColumnTypes.TEXT,
        copyable: false,
        header: {
            align: 'right',
            label: 'Age',
        },
        sorting: {
            propertyName: 'age',
            sortDirection: EListSortOrder.ASC,
        },
        width: '150px',
        minWidth: '100px',
        filterType: ETableColumnFilterTypes.NUMBER,
        filterOperators: [
            EFilterOperatorType.EQUALS,
            EFilterOperatorType.NOT_EQUALS,
            EFilterOperatorType.CONTAINS,
            EFilterOperatorType.GREATER_THAN,
            EFilterOperatorType.LESS_THAN,
        ],
    },
    {
        align: 'left',
        propName: 'birthdate',
        type: ETableColumnTypes.DATE,
        copyable: false,
        header: {
            align: 'left',
            label: 'Birthdate',
        },
        sorting: {
            propertyName: 'birthdate',
            sortDirection: EListSortOrder.ASC,
        },
        width: '150px',
        minWidth: '100px',
        filterType: ETableColumnFilterTypes.DATE,
        filterOperators: [
            EFilterOperatorType.EQUALS,
            EFilterOperatorType.NOT_EQUALS,
            EFilterOperatorType.GREATER_THAN,
            EFilterOperatorType.LESS_THAN,
        ],
    },
    {
        align: 'left',
        propName: 'sex',
        type: ETableColumnTypes.TEXT,
        copyable: false,
        header: {
            align: 'left',
            label: 'Sex',
            icon: {
                glyph: 'wc',
                color: ETextCellColor.NEUTRAL,
                placement: 'left',
            },
        },
        sorting: {
            propertyName: 'sex',
            sortDirection: EListSortOrder.ASC,
        },
        width: '150px',
        minWidth: '100px',
    },
    {
        align: 'left',
        propName: 'bio',
        type: ETableColumnTypes.TEXT,
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
        type: ETableColumnTypes.CURRENCY,
        copyable: false,
        header: {
            align: 'right',
            label: 'Bill',
        },
        sorting: {
            propertyName: 'bill',
            sortDirection: EListSortOrder.ASC,
        },
        width: '150px',
        minWidth: '100px',
    },
    {
        align: 'left',
        propName: 'items',
        type: ETableColumnTypes.ARRAY,
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
        type: ETableColumnTypes.TEXT,
        copyable: false,
        header: {
            align: 'left',
            label: 'Responsible Person',
        },
        transform: (value: TPerson[keyof TPerson]): string => {
            const name: { firstname: string; lastname: string } = (value as TResponsiblePerson).name;
            return `${name.firstname} ${name.lastname}`;
        },
        width: '150px',
        minWidth: '100px',
    },
];
