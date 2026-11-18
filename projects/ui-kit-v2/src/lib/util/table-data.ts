/**
 * Данные таблицы, как их прислала модель, приведённые к виду, который можно рисовать.
 *
 * Модель ошибается в форме: присылает строку объектом, столбец строкой, итог числом. Блок от
 * этого не ломается — испорченная часть выпадает или становится пустой. Отказ один: столбцов
 * нет или строки не списком, тогда рисовать нечего, и показывается плашка блока.
 */

/** Род столбца: от него зависят запись значения и выравнивание. */
export enum ERtTableColumn {
    Text = 'text',
    Number = 'number',
    Percent = 'percent',
    Currency = 'currency',
}

/** Значение ячейки после приведения: число, строка или пусто. */
export type TRtTableValue = number | string | null;

/** Столбец после приведения. */
export interface IRtTableColumn {
    readonly label: string;
    readonly type: ERtTableColumn;
    /** Код валюты, как пришёл; проверяется при записи значения. */
    readonly currency: string | null;
}

/** Таблица после приведения: каждая строка и итог ровно по числу столбцов. */
export interface IRtTableData {
    readonly columns: readonly IRtTableColumn[];
    readonly rows: readonly (readonly TRtTableValue[])[];
    /** Строка итога; `null`, когда итога нет. */
    readonly total: readonly TRtTableValue[] | null;
}

/** Ячейка, как её рисуют: текст, край выравнивания и пометка отрицательного значения. */
export interface IRtTableCell {
    readonly text: string;
    readonly align: 'start' | 'end';
    /** Число числового столбца, чья запись ниже нуля: рисуется цветом ошибки. */
    readonly negative: boolean;
}

/** Запись значения одного столбца. */
export type TRtTableCellWriter = (value: TRtTableValue) => IRtTableCell;

const COLUMN_TYPES: readonly ERtTableColumn[] = Object.values(ERtTableColumn);
/** Код валюты, который кит пишет знаком валюты; любой другой пишется как число. */
const CURRENCY_CODE: RegExp = /^[A-Z]{3}$/;
/** Язык, которым пишутся значения, когда язык кита `Intl` не принимает. */
const FALLBACK_LOCALE: string = 'en';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function columnType(value: unknown): ERtTableColumn {
    return COLUMN_TYPES.find((type: ERtTableColumn): boolean => type === value) ?? ERtTableColumn.Text;
}

/** Столбец из присланного: не объект — текстовый без подписи, неизвестный род — текст. */
export function rtTableColumn(value: unknown): IRtTableColumn {
    if (!isRecord(value)) {
        return { label: '', type: ERtTableColumn.Text, currency: null };
    }

    const label: unknown = value['label'];
    const currency: unknown = value['currency'];

    return {
        label: typeof label === 'string' ? label : '',
        type: columnType(value['type']),
        currency: typeof currency === 'string' ? currency : null,
    };
}

/** Значение ячейки: всё, что не число, не строка и не `null`, — пустая ячейка. */
export function rtTableValue(value: unknown): TRtTableValue {
    return typeof value === 'number' || typeof value === 'string' ? value : null;
}

/** Строка, подогнанная под число столбцов: короткая добирается пустыми, лишнее отбрасывается. */
export function rtTableFitRow(row: readonly unknown[], width: number): TRtTableValue[] {
    return Array.from({ length: width }, (_: unknown, index: number): TRtTableValue => rtTableValue(row[index]));
}

/** Итог: не список, пустой список или все ячейки пусты после подгонки — итога нет. */
export function rtTableTotal(total: unknown, width: number): TRtTableValue[] | null {
    if (!Array.isArray(total)) {
        return null;
    }

    const fitted: TRtTableValue[] = rtTableFitRow(total, width);

    return fitted.some((value: TRtTableValue): boolean => value !== null) ? fitted : null;
}

/**
 * Таблица из присланных частей блока. `null` — столбцы не непустым списком или строки не
 * списком: такой блок показывается плашкой.
 */
export function rtTableData(columns: unknown, rows: unknown, total: unknown): IRtTableData | null {
    if (!Array.isArray(columns) || columns.length === 0 || !Array.isArray(rows)) {
        return null;
    }

    const width: number = columns.length;

    return {
        columns: columns.map((column: unknown): IRtTableColumn => rtTableColumn(column)),
        rows: rows
            .filter((row: unknown): row is unknown[] => Array.isArray(row))
            .map((row: unknown[]): TRtTableValue[] => rtTableFitRow(row, width)),
        total: rtTableTotal(total, width),
    };
}

function numberOptions(column: IRtTableColumn): Intl.NumberFormatOptions {
    if (column.type === ERtTableColumn.Percent) {
        return { style: 'percent', maximumFractionDigits: 1, signDisplay: 'negative' };
    }

    if (column.type === ERtTableColumn.Currency && column.currency !== null && CURRENCY_CODE.test(column.currency)) {
        return { style: 'currency', currency: column.currency, signDisplay: 'negative' };
    }

    return { maximumFractionDigits: 2, signDisplay: 'negative' };
}

function numberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
    try {
        return new Intl.NumberFormat(locale, options);
    } catch {
        return new Intl.NumberFormat(FALLBACK_LOCALE, options);
    }
}

function textCell(value: TRtTableValue): IRtTableCell {
    return { text: value === null ? '' : String(value), align: 'start', negative: false };
}

/**
 * Запись значений столбца для языка кита. Числовой столбец пишет число через `Intl.NumberFormat`,
 * минус и знак процента — как пишет язык; запись, равная нулю, идёт без минуса и без цвета.
 * Строку в числовом столбце кит не разбирает: она стоит как пришла, у края столбца.
 */
export function rtTableCellWriter(column: IRtTableColumn, locale: string): TRtTableCellWriter {
    if (column.type === ERtTableColumn.Text) {
        return textCell;
    }

    const format: Intl.NumberFormat = numberFormat(locale, numberOptions(column));

    return (value: TRtTableValue): IRtTableCell => {
        if (typeof value === 'string') {
            return { text: value, align: 'end', negative: false };
        }

        if (value === null || !Number.isFinite(value)) {
            return { text: '', align: 'end', negative: false };
        }

        const parts: Intl.NumberFormatPart[] = format.formatToParts(value);

        return {
            text: parts.map((part: Intl.NumberFormatPart): string => part.value).join(''),
            align: 'end',
            negative: parts.some((part: Intl.NumberFormatPart): boolean => part.type === 'minusSign'),
        };
    };
}
