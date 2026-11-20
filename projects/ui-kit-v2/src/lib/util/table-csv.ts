/**
 * Таблица текстом: CSV для кнопки «Copy CSV» и строки через табуляцию для копии ответа.
 *
 * CSV идёт в файл или в импорт таблицы, поэтому число в нём сырое — с точкой, без группировки и
 * знаков, при любом языке. Копию ответа читает человек: значения в ней такие, как их показывает
 * таблица.
 */
import { IRtTableColumn, IRtTableData, rtTableCellWriter, TRtTableCellWriter, TRtTableValue } from './table-data';

/** Начало текстового поля, которое таблица выполнила бы как формулу. */
const FORMULA_START: RegExp = /^[=+\-@\t\r]/;
/** Поле, которое без кавычек разорвало бы строку CSV. */
const NEEDS_QUOTES: RegExp = /[",\r\n]/;
/** Табуляция и перенос строки внутри значения копии ответа. */
const LINE_BREAKS: RegExp = /\r\n|[\t\r\n]/g;

function csvText(text: string): string {
    const safe: string = FORMULA_START.test(text) ? `'${text}` : text;

    return NEEDS_QUOTES.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function csvValue(value: TRtTableValue): string {
    if (typeof value === 'string') {
        return csvText(value);
    }

    return value !== null && Number.isFinite(value) ? String(value) : '';
}

function tableLines(data: IRtTableData): (readonly TRtTableValue[])[] {
    return data.total === null ? [...data.rows] : [...data.rows, data.total];
}

/**
 * CSV таблицы: шапка, строки и итог; значения через запятую, строки через CRLF. Каждая строка и
 * подпись шапки — текстовое поле: начало как у формулы получает апостроф до кавычек.
 */
export function rtTableCsv(data: IRtTableData): string {
    const head: string = data.columns.map((column: IRtTableColumn): string => csvText(column.label)).join(',');
    const body: string[] = tableLines(data).map((row: readonly TRtTableValue[]): string => row.map(csvValue).join(','));

    return [head, ...body].join('\r\n');
}

function plain(text: string): string {
    return text.replace(LINE_BREAKS, ' ');
}

/**
 * Таблица для копии ответа: шапка, строки и итог через табуляцию, строки через перевод строки.
 * Значения записаны для языка кита, как их показывает таблица.
 */
export function rtTablePlainText(data: IRtTableData, locale: string): string {
    const writers: TRtTableCellWriter[] = data.columns.map((column: IRtTableColumn): TRtTableCellWriter =>
        rtTableCellWriter(column, locale)
    );
    const head: string = data.columns.map((column: IRtTableColumn): string => plain(column.label)).join('\t');
    const body: string[] = tableLines(data).map((row: readonly TRtTableValue[]): string =>
        row.map((value: TRtTableValue, index: number): string => plain(writers[index](value).text)).join('\t')
    );

    return [head, ...body].join('\n');
}
