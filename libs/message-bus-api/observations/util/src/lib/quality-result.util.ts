/**
 * Счёт результата работы в разделе «Качество»: плитки, веха G по дням, пары подряд и окна эпиков.
 *
 * Строка дня несёт суммы одной копии за один день, здесь они складываются по периоду. Ключ, которого
 * строка не несёт, не ноль: строка старой редакции его просто не знает. Поэтому плитка складывает
 * только строки с ключом и называет, сколько строк его не несли.
 */
import {
    EQualityEpicState,
    EQualityMilestone,
    EQualityResultTile,
    IQualityEpicWindow,
    IQualityMilestoneDay,
    IQualityPair,
    IQualityResult,
    IQualityResultTile,
    ITreeChoice,
} from '@rt/message-bus-common';

import { IQualityDayRow } from './quality.util';

/** Три класса отказов записи хода: их сумма против вызовов — «Отказов на сто вызовов». */
const REFUSAL_KEYS: readonly string[] = ['refusalsHook', 'refusalsPermission', 'refusalsStop'];

/** Ключи, по которым день узнаётся как день новой редакции: только у таких дней есть веха. */
const RESULT_KEYS: readonly string[] = [
    'calls',
    'tasksMerged',
    'tasksTimed',
    'idleMinutes',
    'reasks',
    'interrupts',
    'ownerWords',
    'goalNotMet',
    'deadEnds',
];

/** Порог вехи G: отказов на сто вызовов меньше него. */
const MILESTONE_G_LIMIT: number = 5;

const PAIR_PREFIX: string = 'refusalPairs:';

const MINUTES_PER_HOUR: number = 60;

/** Окно эпика, каким его читает счёт. */
export interface IQualityWindowRow {
    readonly tree: ITreeChoice;
    readonly origin: string;
    readonly epic: number;
    readonly openedAt: Date;
    readonly closedAt: Date | null;
    readonly calls: number;
    readonly refusals: number;
    readonly reasks: number;
    readonly mergedAt: Date | null;
    readonly releasedAt: Date | null;
    readonly minutes: number | null;
}

function round(value: number, digits: number): number {
    const scale: number = 10 ** digits;

    return Math.round(value * scale) / scale;
}

function carrying(rows: readonly IQualityDayRow[], key: string): readonly IQualityDayRow[] {
    return rows.filter((row: IQualityDayRow): boolean => row.metrics[key] !== undefined);
}

function sumOf(rows: readonly IQualityDayRow[], keys: readonly string[]): number {
    return rows.reduce(
        (sum: number, row: IQualityDayRow): number =>
            sum + keys.reduce((part: number, key: string): number => part + (row.metrics[key] ?? 0), 0),
        0
    );
}

/** Плитка одного ключа: сумма по строкам, что его несут, в единицах экрана. */
function tileOf(
    rows: readonly IQualityDayRow[],
    key: string,
    unit: (sum: number) => number = (sum: number): number => sum
): IQualityResultTile {
    const carried: readonly IQualityDayRow[] = carrying(rows, key);

    return { value: carried.length > 0 ? unit(sumOf(carried, [key])) : null, missing: rows.length - carried.length };
}

/** Отказы трёх классов на сто вызовов по строкам, что несут вызовы. Ноль вызовов делить не на что. */
function per100Of(rows: readonly IQualityDayRow[]): number | null {
    const calls: number = sumOf(rows, ['calls']);

    return calls > 0 ? round((sumOf(rows, REFUSAL_KEYS) * 100) / calls, 2) : null;
}

const TILES: Readonly<Record<EQualityResultTile, (rows: readonly IQualityDayRow[]) => IQualityResultTile>> = {
    [EQualityResultTile.TasksMerged]: (rows: readonly IQualityDayRow[]): IQualityResultTile => tileOf(rows, 'tasksMerged'),
    [EQualityResultTile.RefusalsPer100]: (rows: readonly IQualityDayRow[]): IQualityResultTile => {
        const carried: readonly IQualityDayRow[] = carrying(rows, 'calls');

        return { value: per100Of(carried), missing: rows.length - carried.length };
    },
    [EQualityResultTile.Idle]: (rows: readonly IQualityDayRow[]): IQualityResultTile =>
        tileOf(rows, 'idleMinutes', (sum: number): number => round(sum / MINUTES_PER_HOUR, 1)),
    [EQualityResultTile.Reasks]: (rows: readonly IQualityDayRow[]): IQualityResultTile => tileOf(rows, 'reasks'),
    [EQualityResultTile.Interrupts]: (rows: readonly IQualityDayRow[]): IQualityResultTile => tileOf(rows, 'interrupts'),
    [EQualityResultTile.GoalNotMet]: (rows: readonly IQualityDayRow[]): IQualityResultTile => tileOf(rows, 'goalNotMet'),
    [EQualityResultTile.DeadEnds]: (rows: readonly IQualityDayRow[]): IQualityResultTile => tileOf(rows, 'deadEnds'),
};

/** Плитки результата периода и подписи под ними. */
export function qualityResultOf(rows: readonly IQualityDayRow[]): IQualityResult {
    const tiles: Record<string, IQualityResultTile> = {};

    for (const tile of Object.values(EQualityResultTile)) {
        tiles[tile] = TILES[tile](rows);
    }
    const timed: number = sumOf(rows, ['tasksTimed']);
    const words: readonly IQualityDayRow[] = carrying(rows, 'ownerWords');

    return {
        tiles: tiles as Record<EQualityResultTile, IQualityResultTile>,
        takenHours: timed > 0 ? round(sumOf(rows, ['takenMinutes']) / timed / MINUTES_PER_HOUR, 1) : null,
        ownerWords: words.length > 0 ? sumOf(words, ['ownerWords']) : null,
    };
}

function milestoneOf(rows: readonly IQualityDayRow[]): EQualityMilestone {
    const per100: number | null = per100Of(rows);

    if (per100 === null) {
        return EQualityMilestone.NoCalls;
    }

    return per100 < MILESTONE_G_LIMIT && sumOf(rows, ['deadEnds']) === 0 ? EQualityMilestone.Reached : EQualityMilestone.Missed;
}

/** Веха G каждого дня, чьи строки несут числа результата: у дня старой редакции её не из чего считать. */
export function qualityMilestonesOf(rows: readonly IQualityDayRow[]): readonly IQualityMilestoneDay[] {
    const days: readonly string[] = [
        ...new Set(
            rows
                .filter((row: IQualityDayRow): boolean => RESULT_KEYS.some((key: string): boolean => row.metrics[key] !== undefined))
                .map((row: IQualityDayRow): string => row.day)
        ),
    ].sort((left: string, right: string): number => left.localeCompare(right));

    return days.map((day: string): IQualityMilestoneDay => ({
        day,
        milestone: milestoneOf(rows.filter((row: IQualityDayRow): boolean => row.day === day)),
    }));
}

/** Пары подряд по обеим половинам ключа, частые первыми. */
export function qualityPairsOf(rows: readonly IQualityDayRow[]): readonly IQualityPair[] {
    const counts: Map<string, number> = new Map();

    for (const row of rows) {
        for (const [key, value] of Object.entries(row.metrics)) {
            if (key.startsWith(PAIR_PREFIX)) {
                counts.set(key.slice(PAIR_PREFIX.length), (counts.get(key.slice(PAIR_PREFIX.length)) ?? 0) + value);
            }
        }
    }

    return [...counts]
        .map(([names, count]: [string, number]): IQualityPair => {
            const at: number = names.indexOf(':');

            return { first: names.slice(0, at), second: names.slice(at + 1), count };
        })
        .sort(
            (left: IQualityPair, right: IQualityPair): number =>
                right.count - left.count || left.first.localeCompare(right.first) || left.second.localeCompare(right.second)
        );
}

/** Состояние эпика на конец периода: выпуск более позднего дня окно прошлого дня не трогает. */
function stateAt(window: IQualityWindowRow, end: Date): EQualityEpicState {
    if (window.releasedAt && window.releasedAt <= end) {
        return EQualityEpicState.Released;
    }

    return window.mergedAt && window.mergedAt <= end ? EQualityEpicState.NotReleased : EQualityEpicState.Open;
}

function shownOf(window: IQualityWindowRow, end: Date): IQualityEpicWindow {
    const state: EQualityEpicState = stateAt(window, end);

    return {
        state,
        tree: window.tree,
        origin: window.origin,
        epic: window.epic,
        from: window.openedAt.toISOString(),
        to: window.closedAt?.toISOString() ?? null,
        calls: window.calls,
        refusals: window.refusals,
        reasks: window.reasks,
        hours: state !== EQualityEpicState.Open && window.minutes !== null ? round(window.minutes / MINUTES_PER_HOUR, 1) : null,
    };
}

/**
 * Окна, чей отрезок задевает период, поздние первыми. Открытое окно тянется до сейчас, поэтому
 * задевает любой период после своего открытия. Дерево сужает окна, версия — нет.
 */
export function qualityEpicWindowsOf(
    windows: readonly IQualityWindowRow[],
    period: { readonly from: string; readonly to: string; readonly tree: string }
): readonly IQualityEpicWindow[] {
    const start: Date = new Date(`${period.from}T00:00:00.000Z`);
    const end: Date = new Date(`${period.to}T23:59:59.999Z`);

    const overlaps: (window: IQualityWindowRow) => boolean = (window: IQualityWindowRow): boolean =>
        window.openedAt <= end && (window.closedAt === null || window.closedAt >= start);

    return windows
        .filter((window: IQualityWindowRow): boolean => (!period.tree || window.tree.slug === period.tree) && overlaps(window))
        .sort((left: IQualityWindowRow, right: IQualityWindowRow): number => right.openedAt.getTime() - left.openedAt.getTime())
        .map((window: IQualityWindowRow): IQualityEpicWindow => shownOf(window, end));
}
