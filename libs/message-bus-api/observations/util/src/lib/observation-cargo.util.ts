/**
 * Разбор груза наблюдений в дни и строки — чистый, без хранилища и без отказа наружу.
 *
 * Что не сошлось, называется местом: день и номер строки в нём. Груз отбивается целиком, а не
 * строкой: половина дня, легшая в хранилище, читалась бы как полный день, и число загрузок в
 * нём было бы неправдой.
 */
import { OBSERVATION_EVENTS } from '@rt-tools/agent-kit/cargo';
import { isCargoBody, TCargoBody } from '@rt/message-bus-common';

import { OBSERVATION_DAY, OBSERVATION_FIELD_BYTES, OBSERVATION_LINE_FIELDS, OBSERVATION_TEXT_FIELDS } from './observation.const';

/** Чем именно груз наблюдений не прошёл разбор. */
export enum EObservationsFault {
    /** Дни — не список, или день без имени, или строки дня — не список. */
    Days = 'days',
    /** Строк в грузе больше предела. */
    Lines = 'lines',
    /** У строки нет обязательного поля или оно не текст. */
    Fields = 'fields',
    /** Событие строки не из объявленного набора. */
    Event = 'event',
    /** Время строки не читается. */
    Time = 'time',
    /** Текстовое поле длиннее предела. */
    Length = 'length',
}

export interface IObservationsFault {
    readonly kind: EObservationsFault;
    /** День и номер строки в нём, где не сошлось; у отказа по числу строк — число и предел. */
    readonly day: string;
    readonly at: number;
    readonly detail: string;
}

/** Строка, готовая лечь в хранилище: без дерева, его добавляет приём. */
export interface IParsedObservationRow {
    readonly day: string;
    readonly t: Date;
    readonly ev: string;
    readonly res: string;
    readonly kind: string | null;
    readonly skill: string | null;
    readonly sid: string;
    readonly v: string;
}

export interface IParsedObservationDay {
    readonly day: string;
    readonly rows: readonly IParsedObservationRow[];
}

export interface IParsedObservations {
    readonly origin: string;
    readonly days: readonly IParsedObservationDay[];
}

function textOf(line: TCargoBody, field: string): string | null {
    const value: unknown = line[field];

    return typeof value === 'string' ? value : null;
}

function overlong(line: TCargoBody): string | null {
    return (
        OBSERVATION_TEXT_FIELDS.find((field: string): boolean => Buffer.byteLength(textOf(line, field) ?? '') > OBSERVATION_FIELD_BYTES) ??
        null
    );
}

function fault(kind: EObservationsFault, day: string, at: number, detail: string): IObservationsFault {
    return { kind, day, at, detail };
}

function isFault(parsed: IParsedObservationRow | IParsedObservationDay | IObservationsFault): parsed is IObservationsFault {
    return (
        'kind' in parsed &&
        typeof parsed.kind === 'string' &&
        Object.values<string>(EObservationsFault).includes(parsed.kind) &&
        'at' in parsed
    );
}

/** Чем строка не сошлась, кроме полей: событие, время, длина. Пусто — строка годна. */
function lineFault(raw: TCargoBody, day: string, at: number): IObservationsFault | null {
    const missing: readonly string[] = OBSERVATION_LINE_FIELDS.filter((field: string): boolean => !textOf(raw, field));

    if (missing.length > 0) {
        return fault(EObservationsFault.Fields, day, at, missing.join(', '));
    }
    const ev: string = textOf(raw, 'ev') ?? '';

    if (!OBSERVATION_EVENTS.includes(ev)) {
        return fault(EObservationsFault.Event, day, at, ev);
    }
    const time: string = textOf(raw, 't') ?? '';

    if (Number.isNaN(new Date(time).getTime())) {
        return fault(EObservationsFault.Time, day, at, time);
    }
    const long: string | null = overlong(raw);

    return long ? fault(EObservationsFault.Length, day, at, long) : null;
}

/** Одна строка дня. Отказ — с местом. */
function parseLine(raw: unknown, day: string, at: number): IParsedObservationRow | IObservationsFault {
    if (!isCargoBody(raw)) {
        return fault(EObservationsFault.Fields, day, at, OBSERVATION_LINE_FIELDS.join(', '));
    }
    const found: IObservationsFault | null = lineFault(raw, day, at);

    if (found) {
        return found;
    }

    return {
        day,
        t: new Date(textOf(raw, 't') ?? ''),
        ev: textOf(raw, 'ev') ?? '',
        res: textOf(raw, 'res') ?? '',
        kind: textOf(raw, 'kind'),
        skill: textOf(raw, 'skill'),
        sid: textOf(raw, 'sid') ?? '',
        v: textOf(raw, 'v') ?? '',
    };
}

/** День груза с именем и списком строк — или ничего, когда день не читается. */
function dayShapeOf(day: unknown): { readonly name: string; readonly lines: readonly unknown[] } | null {
    if (!isCargoBody(day)) {
        return null;
    }
    const name: string | null = textOf(day, 'day');
    const lines: unknown = day['lines'];

    return name && OBSERVATION_DAY.test(name) && Array.isArray(lines) ? { name, lines } : null;
}

/** Строки одного дня. Отказ первой негодной строки — отказ дня. */
function parseDay(shape: { readonly name: string; readonly lines: readonly unknown[] }): IParsedObservationDay | IObservationsFault {
    const rows: IParsedObservationRow[] = [];

    for (const [index, raw] of shape.lines.entries()) {
        const parsed: IParsedObservationRow | IObservationsFault = parseLine(raw, shape.name, index);

        if (isFault(parsed)) {
            return parsed;
        }
        rows.push(parsed);
    }

    return { day: shape.name, rows };
}

/** Сколько строк везёт груз — до разбора: предел судится раньше, чем читается первая строка. */
export function observationLinesOf(body: TCargoBody): number {
    const days: unknown = body['days'];

    if (!Array.isArray(days)) {
        return 0;
    }

    return days.reduce((sum: number, day: unknown): number => {
        const lines: unknown = isCargoBody(day) ? day['lines'] : undefined;

        return sum + (Array.isArray(lines) ? lines.length : 0);
    }, 0);
}

/**
 * Дни и строки груза. Голова груза уже проверена общей проверкой; здесь — дни.
 *
 * Предел строк судится первым и по числу, а не по весу: вес держит предел запроса, а число —
 * то, сколько строк хранилище положит одной сделкой.
 */
export function parseObservationsCargo(body: TCargoBody, linesCap: number): IParsedObservations | IObservationsFault {
    const total: number = observationLinesOf(body);

    if (total > linesCap) {
        return fault(EObservationsFault.Lines, '', total, String(linesCap));
    }
    const rawDays: unknown = body['days'];

    if (!Array.isArray(rawDays)) {
        return fault(EObservationsFault.Days, '', 0, 'days');
    }
    const days: IParsedObservationDay[] = [];

    for (const day of rawDays as readonly unknown[]) {
        const shape: { readonly name: string; readonly lines: readonly unknown[] } | null = dayShapeOf(day);

        if (!shape) {
            return fault(EObservationsFault.Days, isCargoBody(day) ? (textOf(day, 'day') ?? '') : '', 0, 'day, lines');
        }
        const parsed: IParsedObservationDay | IObservationsFault = parseDay(shape);

        if (isFault(parsed)) {
            return parsed;
        }
        days.push(parsed);
    }

    return { origin: textOf(body, 'origin') ?? '', days };
}

/** Признак отказа среди двух исходов разбора. */
export function isObservationsFault(parsed: IParsedObservations | IObservationsFault): parsed is IObservationsFault {
    return 'kind' in parsed;
}

/** Текст отказа для дерева: место и причина, без устройства приёмника. */
export function observationsFaultMessage(found: IObservationsFault): string {
    const place: string = `день ${found.day}, строка ${found.at + 1}`;

    switch (found.kind) {
        case EObservationsFault.Days:
            return `в грузе рода «наблюдения» дни не читаются: ожидается список дней с полями ${found.detail}`;
        case EObservationsFault.Lines:
            return `в грузе рода «наблюдения» строк ${found.at}, а предел ${found.detail}`;
        case EObservationsFault.Fields:
            return `в грузе рода «наблюдения» не хватает полей: ${place} — ${found.detail}`;
        case EObservationsFault.Event:
            return `в грузе рода «наблюдения» незнакомое событие: ${place} — «${found.detail}», приём знает ${OBSERVATION_EVENTS.join(', ')}`;
        case EObservationsFault.Time:
            return `в грузе рода «наблюдения» не читается время: ${place} — «${found.detail}»`;
        case EObservationsFault.Length:
            return `в грузе рода «наблюдения» поле длиннее предела ${OBSERVATION_FIELD_BYTES} байт: ${place} — ${found.detail}`;
    }
}
