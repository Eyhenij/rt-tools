import { ERtTableColumn, IRtTableColumn, rtTableCellWriter, rtTableCurrency, rtTableNumberFormat, TRtTableCellWriter } from './table-data';

/**
 * Данные блока KPI, как их прислала модель, приведённые к виду, который можно рисовать.
 *
 * Модель ошибается в форме: присылает карточку строкой, значение пустым, дельту строкой. Блок от
 * этого не ломается — карточка без названия или без значения выпадает, испорченная необязательная
 * часть пропадает. Отказ один: карточек не осталось, тогда показывается плашка блока.
 */

/** Род значения карточки: от него зависит запись значения. */
export enum ERtKpiFormat {
    Number = 'number',
    Percent = 'percent',
    Currency = 'currency',
}

/** Единица дельты: проценты к базе или процентные пункты. */
export enum ERtKpiDeltaUnit {
    Percent = 'percent',
    Points = 'points',
}

/** Карточка после приведения. */
export interface IRtKpiItem {
    readonly label: string;
    /** Конечное число или непустая строка: строка пишется как пришла. */
    readonly value: number | string;
    readonly format: ERtKpiFormat;
    /** Код валюты, как пришёл; проверяется при записи значения. */
    readonly currency: string | null;
    /** Изменение к базе; `null` — карточка без строки дельты. */
    readonly delta: number | null;
    readonly deltaUnit: ERtKpiDeltaUnit;
    /** Подпись базы; без дельты не рисуется. */
    readonly base: string | null;
    readonly period: string | null;
    /** Рост показателя хорош для читателя. */
    readonly growthIsGood: boolean;
}

/** Запись значения карточки. */
export type TRtKpiValueWriter = (value: number | string) => string;

const FORMATS: readonly ERtKpiFormat[] = Object.values(ERtKpiFormat);
/** С этого значения по модулю число и сумма пишутся короткой формой. */
const SHORT_FROM: number = 1_000_000;
/** Дробных знаков у числа в полной записи — как у числовой ячейки таблицы. */
const NUMBER_FRACTION_DIGITS: number = 2;

const COLUMN_OF_FORMAT: Readonly<Record<ERtKpiFormat, ERtTableColumn>> = {
    [ERtKpiFormat.Number]: ERtTableColumn.Number,
    [ERtKpiFormat.Percent]: ERtTableColumn.Percent,
    [ERtKpiFormat.Currency]: ERtTableColumn.Currency,
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function finite(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function kpiValue(value: unknown): number | string | null {
    return finite(value) ?? text(value);
}

function kpiFormat(value: unknown): ERtKpiFormat {
    return FORMATS.find((format: ERtKpiFormat): boolean => format === value) ?? ERtKpiFormat.Number;
}

/**
 * Карточка из присланного. `null` — не объект, нет названия или нет значения: такая карточка
 * выпадает. Испорченная необязательная часть пропадает, а не отвергает карточку.
 */
export function rtKpiItem(value: unknown): IRtKpiItem | null {
    if (!isRecord(value)) {
        return null;
    }

    const label: string | null = text(value['label']);
    const itemValue: number | string | null = kpiValue(value['value']);

    if (label === null || itemValue === null) {
        return null;
    }

    const currency: unknown = value['currency'];
    const growthIsGood: unknown = value['growthIsGood'];

    return {
        label,
        value: itemValue,
        format: kpiFormat(value['format']),
        currency: typeof currency === 'string' ? currency : null,
        delta: finite(value['delta']),
        deltaUnit: value['deltaUnit'] === ERtKpiDeltaUnit.Points ? ERtKpiDeltaUnit.Points : ERtKpiDeltaUnit.Percent,
        base: text(value['base']),
        period: text(value['period']),
        growthIsGood: typeof growthIsGood === 'boolean' ? growthIsGood : true,
    };
}

/** Карточки блока по порядку. `null` — `items` не список или карточек не осталось: плашка. */
export function rtKpiItems(items: unknown): IRtKpiItem[] | null {
    if (!Array.isArray(items)) {
        return null;
    }

    const kept: IRtKpiItem[] = items
        .map((item: unknown): IRtKpiItem | null => rtKpiItem(item))
        .filter((item: IRtKpiItem | null): item is IRtKpiItem => item !== null);

    return kept.length > 0 ? kept : null;
}

function fullFractionDigits(currency: string | null, locale: string): number {
    return currency === null
        ? NUMBER_FRACTION_DIGITS
        : (rtTableNumberFormat(locale, { currency, style: 'currency' }).resolvedOptions().maximumFractionDigits ?? NUMBER_FRACTION_DIGITS);
}

/** Значение доходит до миллиона по модулю после округления полной записи. */
function reachesShort(value: number, digits: number): boolean {
    const scale: number = 10 ** digits;

    return Math.round(Math.abs(value) * scale) / scale >= SHORT_FROM;
}

/**
 * Запись значения карточки для языка кита. Полная запись — как у числовой ячейки таблицы того же
 * рода. Число и сумма от миллиона по модулю пишутся короткой формой языка с 0–2 дробными знаками
 * без хвостовых нулей: «1,24 млн ₽». Процент коротким не бывает. Строка стоит как пришла, цвета у
 * значения нет.
 */
export function rtKpiValueWriter(item: Pick<IRtKpiItem, 'format' | 'currency'>, locale: string): TRtKpiValueWriter {
    const column: IRtTableColumn = { label: '', type: COLUMN_OF_FORMAT[item.format], currency: item.currency };
    const full: TRtTableCellWriter = rtTableCellWriter(column, locale);

    if (item.format === ERtKpiFormat.Percent) {
        return (value: number | string): string => full(value).text;
    }

    const currency: string | null = rtTableCurrency(column);
    const digits: number = fullFractionDigits(currency, locale);
    const short: Intl.NumberFormat = rtTableNumberFormat(locale, {
        ...(currency === null ? {} : { currency, style: 'currency' }),
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        signDisplay: 'negative',
    });

    return (value: number | string): string =>
        typeof value === 'number' && reachesShort(value, digits) ? short.format(value) : full(value).text;
}
