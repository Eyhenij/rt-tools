import { EFilterOperatorType, EListSortOrder } from '@rt-tools/utils';

import { ERtDataTableColumnType, ERtDataTableFilterType, IRtDataTable } from '../../../data-table/rt-data-table.model';
import { TRtDesignTokenName } from '../../../../tokens/rt-design-tokens';

/**
 * Люди истории «как в первом ките»: тот же состав колонок, что у списка первого кита на его
 * витрине, — чтобы две витрины можно было положить рядом и сравнить.
 *
 * Первый кит берёт строки у генератора случайных данных. Здесь они постоянные: кадр витрины
 * сравнивается с образцом, и случайная строка роняла бы его без единой правки. Имена выдуманы —
 * в показ не должно попасть ничьё настоящее.
 */

export type TTestPersonStatus = 'active' | 'inactive' | 'invited' | 'deleted';

export type TTestPersonButton = 'ico-plus' | 'close' | 'user' | 'check';

export interface ITestPerson extends Record<string, unknown> {
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly age: number;
    readonly status: TTestPersonStatus;
    readonly sex: string;
    readonly bio: string;
    readonly bill: number;
    readonly birthdate: string;
    readonly items: string[];
    readonly responsible: string;
    readonly button: TTestPersonButton;
    readonly active: boolean;
    readonly image: string;
}

const FIRST_NAMES: readonly string[] = ['Анна', 'Борис', 'Вера', 'Глеб', 'Дарья', 'Егор', 'Жанна', 'Захар', 'Инна', 'Кирилл'];
const LAST_NAMES: readonly string[] = ['Орлова', 'Соколов', 'Лебедева', 'Воронов', 'Зайцева', 'Волков', 'Белова', 'Козлов'];
const STATUSES: readonly TTestPersonStatus[] = ['active', 'inactive', 'invited', 'deleted'];
/**
 * Значки кнопки в ячейке — пары имён Material первого кита (`add`, `clear`, `person`) по перечню
 * соответствий: так материальный набор рисует те же рисунки. `save` пары в ките нет, вместо него
 * галочка.
 */
const BUTTONS: readonly TTestPersonButton[] = ['ico-plus', 'close', 'user', 'check'];
const ITEMS: readonly string[] = ['Заявка', 'Договор', 'Счёт', 'Акт', 'Отчёт'];

/**
 * Картинки строк встроены в адрес, а не берутся из сети: витрина отрезана от чужой сети, и
 * картинка извне дала бы пустое место в кадре.
 */
/**
 * Цвета картинок — ступени материальной шкалы кита, те же, что стоят на картинках витрины первого
 * кита. Картинка встроена в адрес и свойств страницы не видит, поэтому ступень читается у корня
 * страницы в момент сборки данных, а не повторяется кодом цвета.
 */
const IMAGE_STEPS: readonly TRtDesignTokenName[] = [
    '--rt-mat-blue-100',
    '--rt-mat-green-100',
    '--rt-mat-orange-100',
    '--rt-mat-red-100',
    '--rt-mat-blue-60',
];

function imageOf(index: number): string {
    const color: string = getComputedStyle(document.documentElement)
        .getPropertyValue(IMAGE_STEPS[index % IMAGE_STEPS.length])
        .trim();
    const svg: string = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><rect width="100" height="40" fill="${color}"/></svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function personOf(index: number): ITestPerson {
    const first: string = FIRST_NAMES[index % FIRST_NAMES.length];
    const last: string = LAST_NAMES[(index * 3) % LAST_NAMES.length];
    const year: number = 1995 + ((index * 7) % 23);

    return {
        id: 1000 + index,
        name: `${first} ${last}`,
        email: `user${index + 1}@example.com`,
        age: 2026 - year,
        status: STATUSES[index % STATUSES.length],
        sex: index % 2 ? 'мужской' : 'женский',
        bio: index % 3 ? 'Работает с заявками' : 'Отвечает за договоры с поставщиками и сверку счетов в конце месяца',
        bill: 1200 * (index + 1) * (index + 3),
        birthdate: `${year}-0${(index % 9) + 1}-1${index % 10}T00:00:00.000Z`,
        items: ITEMS.slice(0, (index % ITEMS.length) + 1),
        responsible: `${FIRST_NAMES[(index + 4) % FIRST_NAMES.length]} ${LAST_NAMES[(index + 1) % LAST_NAMES.length]}`,
        button: BUTTONS[index % BUTTONS.length],
        active: index % 2 === 0,
        image: imageOf(index),
    };
}

/** Двадцать человек — как у первого кита в истории со многими записями. */
export const TEST_PEOPLE: ITestPerson[] = Array.from({ length: 20 }, (_: unknown, index: number) => personOf(index));

/** Цвет точки состояния: тот же приём, что у первого кита, — стиль значка от значения. */
const STATUS_COLORS: Record<TTestPersonStatus, string> = {
    active: 'green',
    inactive: 'orange',
    invited: 'lightblue',
    deleted: 'red',
};

const toMoney: (value: unknown) => string = (value: unknown): string => `${Number(value).toLocaleString('ru-RU')} ₽`;
const toDay: (value: unknown) => string = (value: unknown): string => new Date(String(value)).toLocaleDateString('ru-RU');
const toItems: (value: unknown) => string = (value: unknown): string => (value as string[]).join(', ');

const TEXT_OPERATORS: EFilterOperatorType[] = [EFilterOperatorType.EQUALS, EFilterOperatorType.NOT_EQUALS, EFilterOperatorType.CONTAINS];

function column(
    propName: Extract<keyof ITestPerson, string>,
    label: string,
    type: ERtDataTableColumnType,
    patch: Partial<IRtDataTable.Column<ITestPerson>> = {}
): IRtDataTable.Column<ITestPerson> {
    return { align: 'left', propName, type, copyable: false, header: { align: 'left', label }, ...patch };
}

function sorted(propName: Extract<keyof ITestPerson, string>): Partial<IRtDataTable.Column<ITestPerson>> {
    return { sorting: { propertyName: propName, sortDirection: EListSortOrder.ASC } };
}

/**
 * Колонки первого кита по порядку. Имена значков — тоже его: таблица переводит их перечнем
 * соответствий кита, а имя без пары рисует без значка — так же видно, чего в перечне нет.
 */
export const TEST_PEOPLE_COLUMNS: Array<IRtDataTable.Column<ITestPerson>> = [
    column('id', 'ID', ERtDataTableColumnType.TEXT, { ...sorted('id'), copyable: true, width: '100px', minWidth: '100px', hidden: true }),
    column('button', 'Button', ERtDataTableColumnType.CUSTOM, { width: '100px', minWidth: '100px' }),
    column('active', 'Active', ERtDataTableColumnType.CUSTOM, { width: '100px', minWidth: '100px' }),
    column('image', 'Image', ERtDataTableColumnType.CUSTOM, { width: '100px', minWidth: '100px' }),
    column('name', 'Name', ERtDataTableColumnType.TEXT, {
        ...sorted('name'),
        copyable: true,
        header: { align: 'left', label: 'Name', icon: { glyph: 'info', color: 'neutral', placement: 'right' } },
        icon: { glyph: 'info', color: 'neutral', placement: 'right' },
        width: '200px',
        minWidth: '200px',
        filterType: ERtDataTableFilterType.TEXT,
        filterOperators: TEXT_OPERATORS,
    }),
    column('email', 'Email', ERtDataTableColumnType.TEXT, {
        ...sorted('email'),
        copyable: true,
        header: { align: 'left', label: 'Email', icon: { glyph: 'email', color: 'neutral', placement: 'left' } },
        icon: { glyph: 'info', color: 'neutral', placement: 'left' },
        width: '200px',
        minWidth: '200px',
        filterType: ERtDataTableFilterType.TEXT,
        filterOperators: TEXT_OPERATORS,
    }),
    column('status', 'Status', ERtDataTableColumnType.TEXT, {
        ...sorted('status'),
        icon: { glyph: 'info', color: 'neutral', placement: 'left' },
        iconTransform: (value: ITestPerson[keyof ITestPerson]): string =>
            `color: ${STATUS_COLORS[value as TTestPersonStatus]}; font-size: 0.5rem; width: 0.5rem; height: 0.5rem`,
        minWidth: '120px',
        filterType: ERtDataTableFilterType.SELECT,
        filterSelectOptions: [...STATUSES],
    }),
    column('age', 'Age', ERtDataTableColumnType.TEXT, {
        ...sorted('age'),
        align: 'right',
        header: { align: 'right', label: 'Age' },
        width: '150px',
        minWidth: '100px',
        filterType: ERtDataTableFilterType.NUMBER,
        filterOperators: [...TEXT_OPERATORS, EFilterOperatorType.GREATER_THAN, EFilterOperatorType.LESS_THAN],
    }),
    column('birthdate', 'Birthdate', ERtDataTableColumnType.DATE, {
        ...sorted('birthdate'),
        transform: toDay,
        width: '150px',
        minWidth: '100px',
        filterType: ERtDataTableFilterType.DATE,
    }),
    column('sex', 'Sex', ERtDataTableColumnType.TEXT, {
        ...sorted('sex'),
        header: { align: 'left', label: 'Sex', icon: { glyph: 'person', color: 'neutral', placement: 'left' } },
        width: '150px',
        minWidth: '100px',
    }),
    column('bio', 'Bio', ERtDataTableColumnType.TEXT, { width: '200px', minWidth: '150px' }),
    column('bill', 'Bill', ERtDataTableColumnType.CURRENCY, {
        ...sorted('bill'),
        align: 'right',
        header: { align: 'right', label: 'Bill' },
        transform: toMoney,
        width: '150px',
        minWidth: '100px',
    }),
    column('items', 'Items', ERtDataTableColumnType.ARRAY, { transform: toItems, width: '300px', minWidth: '200px' }),
    column('responsible', 'Responsible Person', ERtDataTableColumnType.TEXT, { width: '150px', minWidth: '100px' }),
];
