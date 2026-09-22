import { EListSortOrder } from '@rt-tools/utils';

import { ERtDataTableColumnType, ERtDataTableFilterType, IRtDataTable } from '../../rt-data-table.model';

/** Города строк: те же значения стоят и в вариантах отбора. */
const CITY_MOSCOW: string = 'Москва';
const CITY_SPB: string = 'Санкт-Петербург';
const CITY_NSK: string = 'Новосибирск';

/** Колонка сортируется, когда у неё объявлен порядок; направление ставит приложение. */
const SORTING: IRtDataTable.Column<ITestDataTableRow>['sorting'] = { propertyName: 'title', sortDirection: EListSortOrder.ASC };

/** Строка витрины: значения выдуманы — в показ не должно попасть ничьё настоящее имя. */
export interface ITestDataTableRow extends Record<string, unknown> {
    readonly id: number;
    readonly title: string;
    readonly city: string;
    readonly sum: number;
    readonly share: number;
    readonly signed: string;
    readonly active: boolean;
    readonly tags: string[];
}

export const TEST_DATA_TABLE_ROWS: ITestDataTableRow[] = [
    {
        id: 1,
        title: 'Договор №2024-118',
        city: CITY_MOSCOW,
        sum: 148000,
        share: 0.42,
        signed: '2024-03-14T00:00:00.000Z',
        active: true,
        tags: ['связь', 'монтаж'],
    },
    {
        id: 2,
        title: 'Договор №2024-119',
        city: CITY_SPB,
        sum: 92400,
        share: 0.18,
        signed: '2024-05-02T00:00:00.000Z',
        active: false,
        tags: ['аренда'],
    },
    {
        id: 3,
        title: 'Договор №2024-120',
        city: CITY_NSK,
        sum: 61000,
        share: 0.07,
        signed: '2024-07-21T00:00:00.000Z',
        active: true,
        tags: [],
    },
];

function columnOf(
    propName: keyof ITestDataTableRow,
    label: string,
    type: ERtDataTableColumnType,
    patch: Partial<IRtDataTable.Column<ITestDataTableRow>> = {}
): IRtDataTable.Column<ITestDataTableRow> {
    return {
        align: 'left',
        propName,
        type,
        copyable: false,
        header: { align: 'left', label },
        ...patch,
    };
}

/**
 * Вид колонки значение не форматирует — ни в первом ките, ни здесь: ячейка показывает то, что
 * лежит в записи, пока колонка не даст `transform`. Поэтому витрина даёт его так же, как дало бы
 * приложение: без него в кадре стояли бы `148000`, `0.42` и момент ISO целиком.
 */
const toMoney: (value: unknown) => string = (value: unknown): string => `${Number(value).toLocaleString('ru-RU')} ₽`;
const toPercent: (value: unknown) => string = (value: unknown): string => `${Math.round(Number(value) * 100)}%`;
const toDay: (value: unknown) => string = (value: unknown): string => new Date(String(value)).toLocaleDateString('ru-RU');
const toYesNo: (value: unknown) => string = (value: unknown): string => (value ? 'да' : 'нет');
const toTags: (value: unknown) => string = (value: unknown): string => (value as string[]).join(', ');

/** Каждый тип колонки по разу: так видно, чем готовая ячейка рисует значение каждого вида. */
export const TEST_DATA_TABLE_COLUMNS: Array<IRtDataTable.Column<ITestDataTableRow>> = [
    columnOf('title', 'Договор', ERtDataTableColumnType.TEXT, { copyable: true, sorting: SORTING }),
    columnOf('city', 'Город', ERtDataTableColumnType.TEXT),
    columnOf('sum', 'Сумма', ERtDataTableColumnType.CURRENCY, { align: 'right', transform: toMoney }),
    columnOf('share', 'Доля', ERtDataTableColumnType.PERCENT, { align: 'right', transform: toPercent }),
    columnOf('signed', 'Подписан', ERtDataTableColumnType.DATE, { transform: toDay }),
    columnOf('active', 'Действует', ERtDataTableColumnType.BOOLEAN, { transform: toYesNo }),
    columnOf('tags', 'Метки', ERtDataTableColumnType.ARRAY, { transform: toTags }),
];

/** Тот же состав покороче: где ось не о типах колонок, семь колонок только мешают читать. */
export const TEST_DATA_TABLE_SHORT_COLUMNS: Array<IRtDataTable.Column<ITestDataTableRow>> = [
    columnOf('title', 'Договор', ERtDataTableColumnType.TEXT, { sorting: SORTING }),
    columnOf('city', 'Город', ERtDataTableColumnType.TEXT),
    columnOf('sum', 'Сумма', ERtDataTableColumnType.CURRENCY, { align: 'right', transform: toMoney }),
];

/**
 * Тот же короткий состав с отбором: у «Договора» — поле, у «Города» — список, у «Суммы» отбора
 * нет вовсе. Третья колонка нужна именно за этим: без неё не видно, что колонка без отбора
 * держит в строке пустое место, а не пропадает из неё.
 */
export const TEST_DATA_TABLE_FILTER_COLUMNS: Array<IRtDataTable.Column<ITestDataTableRow>> = [
    columnOf('title', 'Договор', ERtDataTableColumnType.TEXT, { sorting: SORTING, filterType: ERtDataTableFilterType.TEXT }),
    columnOf('city', 'Город', ERtDataTableColumnType.TEXT, {
        filterType: ERtDataTableFilterType.SELECT,
        filterSelectOptions: [CITY_MOSCOW, CITY_SPB, CITY_NSK],
    }),
    columnOf('sum', 'Сумма', ERtDataTableColumnType.CURRENCY, { align: 'right', transform: toMoney }),
];
