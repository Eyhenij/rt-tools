/**
 * Счёт раздела «Качество». Строки дня несут суммы одной копии за один день, здесь они складываются.
 *
 * Откат приходит не в день приёмки, поэтому принятые с первого раза в строке идут без вычета, и вычитает
 * этот счёт. Дерево и версия сужают и числа итога, и таблицу причин: цикл сверяет одно дерево с самим
 * собой. Полнота остаётся про все деревья.
 */
import {
    compareReleaseVersions,
    IQualityCompleteness,
    IQualityCorrections,
    IQualityDriverRow,
    IQualityFirstPass,
    IQualityRepeats,
    IQualityReport,
    IQualityTreeFault,
    ITreeChoice,
    orderedReleaseVersions,
    QUALITY_FRESH_DAYS,
    QUALITY_SHARE_FROM,
} from '@rt/message-bus-common';

/** Сколько дней после установки фикса ошибка на том же ресурсе считается повтором. */
const REPEAT_WINDOW_DAYS: number = 30;

type TDriverField = keyof Omit<IQualityDriverRow, 'resource' | 'loss'>;

/** Какой ключ строки дня идёт в какую колонку таблицы причин. */
const DRIVER_FIELDS: Readonly<Record<string, TDriverField>> = {
    guardRefusals: 'refusals',
    guardEmpty: 'empty',
    gateRefusals: 'gateRefusals',
    rulesAfterLoad: 'afterLoad',
    wastedRuns: 'wastedRuns',
    wastedSeconds: 'wastedSeconds',
};

/** Строка дня, какой её читает счёт. */
export interface IQualityDayRow {
    readonly tree: ITreeChoice;
    readonly day: string;
    readonly version: string;
    readonly metrics: Readonly<Record<string, number>>;
}

/** Разбор, каким его читает счёт повторов. */
export interface IQualityRecord {
    readonly id: string;
    readonly tree: string;
    readonly resource: string | null;
    /** День приезда. */
    readonly arrived: string;
    readonly releaseVersion: string | null;
    /** День, когда запись дошла до фикса. */
    readonly fixed: string | null;
}

/** С какого дня дерево работает на этой версии. */
export interface IQualityFirstSeen {
    readonly tree: string;
    readonly version: string;
    readonly day: string;
}

export interface IQualityInput {
    readonly from: string;
    readonly to: string;
    /** Сегодняшний день. */
    readonly today: string;
    readonly tree: string;
    readonly version: string;
    /** Страница таблицы причин, с единицы. */
    readonly page: number;
    readonly size: number;
    readonly anyLine: boolean;
    readonly trees: readonly ITreeChoice[];
    /** Строки периода. */
    readonly rows: readonly IQualityDayRow[];
    /** Строки последних дней: по ним считается полнота, что бы ни спросили за период. */
    readonly fresh: readonly IQualityDayRow[];
    readonly records: readonly IQualityRecord[];
    readonly firstSeen: readonly IQualityFirstSeen[];
}

function sumOf(rows: readonly IQualityDayRow[], key: string): number {
    return rows.reduce((sum: number, row: IQualityDayRow): number => sum + (row.metrics[key] ?? 0), 0);
}

function shareOf(part: number, whole: number): number | null {
    return whole < QUALITY_SHARE_FROM ? null : Math.round((part / whole) * 100);
}

function firstPassOf(rows: readonly IQualityDayRow[]): IQualityFirstPass {
    const counted: number = sumOf(rows, 'tasksAccepted') + sumOf(rows, 'tasksClosed');
    const firstPass: number = Math.max(sumOf(rows, 'tasksFirstPass') - sumOf(rows, 'tasksLost'), 0);

    return { counted, firstPass, share: shareOf(firstPass, counted), noHandover: sumOf(rows, 'tasksNoHandover') };
}

function correctionsOf(rows: readonly IQualityDayRow[]): IQualityCorrections {
    const count: number = sumOf(rows, 'ownerCorrections');
    const accepted: number = sumOf(rows, 'tasksAccepted');

    return { count, accepted, perTask: accepted < QUALITY_SHARE_FROM ? null : Math.round((count / accepted) * 100) };
}

function dayAfter(day: string, days: number): string {
    const date: Date = new Date(`${day}T00:00:00Z`);

    date.setUTCDate(date.getUTCDate() + days);

    return date.toISOString().slice(0, 10);
}

/** С какого дня дерево стоит на версии с фиксом. `null`: ещё не поставило. */
function installedOn(tree: string, version: string, firstSeen: readonly IQualityFirstSeen[]): string | null {
    const days: readonly string[] = firstSeen
        .filter((one: IQualityFirstSeen): boolean => one.tree === tree && compareReleaseVersions(one.version, version) >= 0)
        .map((one: IQualityFirstSeen): string => one.day)
        .sort((left: string, right: string): number => left.localeCompare(right));

    return days[0] ?? null;
}

function inWindow(day: string, installed: string): boolean {
    return day.localeCompare(installed) >= 0 && day.localeCompare(dayAfter(installed, REPEAT_WINDOW_DAYS)) <= 0;
}

function repeatsFix(fix: IQualityRecord, one: IQualityRecord, input: IQualityInput): boolean {
    const installed: string | null = installedOn(one.tree, fix.releaseVersion ?? '', input.firstSeen);
    const sameMiss: boolean = one.id !== fix.id && one.resource === fix.resource;

    return sameMiss && installed !== null && inWindow(one.arrived, installed);
}

function inPeriod(day: string, input: IQualityInput): boolean {
    return day.localeCompare(input.from) >= 0 && day.localeCompare(input.to) <= 0;
}

/** Фикс старше месяца входит в долю: моложе ему ещё не на чем было сработать. */
function repeatsOf(input: IQualityInput): IQualityRepeats {
    const edge: string = dayAfter(input.today, -REPEAT_WINDOW_DAYS);
    const fixes: readonly IQualityRecord[] = input.records.filter(
        (one: IQualityRecord): boolean =>
            one.resource !== null && one.releaseVersion !== null && one.fixed !== null && one.fixed.localeCompare(edge) <= 0
    );
    const seen: readonly IQualityRecord[] = input.records.filter(
        (one: IQualityRecord): boolean => inPeriod(one.arrived, input) && (!input.tree || one.tree === input.tree)
    );
    const repeated: readonly IQualityRecord[] = fixes.filter((fix: IQualityRecord): boolean =>
        seen.some((one: IQualityRecord): boolean => repeatsFix(fix, one, input))
    );
    const unnamed: number = seen.filter((one: IQualityRecord): boolean => one.resource === null).length;

    return { repeats: repeated.length, fixes: fixes.length, share: shareOf(repeated.length, fixes.length), unnamed };
}

/** Строки последнего дня каждого дерева: у дерева бывает несколько копий, и сбой любой из них виден. */
function latestOf(rows: readonly IQualityDayRow[]): readonly (readonly IQualityDayRow[])[] {
    const lastDays: Map<string, string> = new Map();

    for (const row of rows) {
        if (row.day.localeCompare(lastDays.get(row.tree.slug) ?? '') > 0) {
            lastDays.set(row.tree.slug, row.day);
        }
    }

    return [...lastDays].map(([tree, day]: [string, string]): readonly IQualityDayRow[] =>
        rows.filter((row: IQualityDayRow): boolean => row.tree.slug === tree && row.day === day)
    );
}

function failedOf(rows: readonly IQualityDayRow[]): IQualityDayRow | undefined {
    return rows.find((row: IQualityDayRow): boolean => (row.metrics['sendFault'] ?? 0) > 0);
}

function completenessOf(input: IQualityInput): IQualityCompleteness {
    const latest: readonly (readonly IQualityDayRow[])[] = latestOf(input.fresh);
    const faults: readonly IQualityTreeFault[] = latest
        .map(failedOf)
        .filter((row: IQualityDayRow | undefined): row is IQualityDayRow => row !== undefined)
        .map((row: IQualityDayRow): IQualityTreeFault => ({ tree: row.tree, fault: row.metrics['sendFault'] }));
    const silent: number = latest.filter((rows: readonly IQualityDayRow[]): boolean =>
        rows.some((row: IQualityDayRow): boolean => (row.metrics['outcomesUnread'] ?? 0) > 0)
    ).length;

    return { enrolled: input.trees.length, sent: latest.length, withOutcomes: latest.length - silent, faults };
}

function emptyDriver(resource: string): IQualityDriverRow {
    return { resource, refusals: 0, empty: 0, gateRefusals: 0, afterLoad: 0, wastedRuns: 0, wastedSeconds: 0, loss: 0 };
}

function lossOf(row: IQualityDriverRow): number {
    return row.empty + row.gateRefusals + row.afterLoad + row.wastedRuns;
}

function addDriver(drivers: Map<string, IQualityDriverRow>, key: string, value: number): void {
    const at: number = key.indexOf(':');
    const field: TDriverField | undefined = DRIVER_FIELDS[key.slice(0, at)];

    if (field) {
        const resource: string = key.slice(at + 1);
        const held: IQualityDriverRow = drivers.get(resource) ?? emptyDriver(resource);

        drivers.set(resource, { ...held, [field]: held[field] + value });
    }
}

function driversOf(rows: readonly IQualityDayRow[]): readonly IQualityDriverRow[] {
    const drivers: Map<string, IQualityDriverRow> = new Map();

    for (const row of rows) {
        for (const [key, value] of Object.entries(row.metrics)) {
            addDriver(drivers, key, value);
        }
    }

    return [...drivers.values()]
        .map((row: IQualityDriverRow): IQualityDriverRow => ({ ...row, loss: lossOf(row) }))
        .filter((row: IQualityDriverRow): boolean => row.loss > 0 || row.refusals > 0)
        .sort(
            (left: IQualityDriverRow, right: IQualityDriverRow): number =>
                right.loss - left.loss || right.refusals - left.refusals || left.resource.localeCompare(right.resource)
        );
}

function narrowed(input: IQualityInput): readonly IQualityDayRow[] {
    return input.rows.filter(
        (row: IQualityDayRow): boolean => (!input.tree || row.tree.slug === input.tree) && (!input.version || row.version === input.version)
    );
}

export function qualityOf(input: IQualityInput): IQualityReport {
    const rows: readonly IQualityDayRow[] = narrowed(input);
    const drivers: readonly IQualityDriverRow[] = driversOf(rows);
    const skip: number = (input.page - 1) * input.size;

    return {
        from: input.from,
        to: input.to,
        anyLine: input.anyLine,
        anyInPeriod: rows.length > 0,
        firstPass: firstPassOf(rows),
        corrections: correctionsOf(rows),
        repeats: repeatsOf(input),
        completeness: completenessOf(input),
        rows: drivers.slice(skip, skip + input.size),
        total: drivers.length,
        page: input.page,
        size: input.size,
        versions: orderedReleaseVersions([...new Set(input.rows.map((row: IQualityDayRow): string => row.version))]),
    };
}

/** С какого дня читать строки для полноты. */
export function qualityFreshFrom(today: string): string {
    return dayAfter(today, 1 - QUALITY_FRESH_DAYS);
}

/** Версия из запроса: пусто — не названа. */
export function qualityVersionOf(query: Record<string, unknown>): string {
    const version: unknown = query['version'];

    return typeof version === 'string' ? version.trim() : '';
}
