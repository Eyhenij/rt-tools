/**
 * Разбор окна эпика: одной копии, одного эпика, одного момента открытия.
 *
 * Окно пересекает дни, поэтому живёт отдельно от строки дня. Поле вне своей формы отказывает всё
 * окно и называется по имени: дерево пишет его в след своей отправки.
 */
import { isMetricOrigin, isMetricValue } from '@rt-tools/agent-kit/cargo';
import { TCargoBody } from '@rt/message-bus-common';

/** Обязательные поля окна. Моменты закрытия, слияния, выпуска и минуты бывают пустыми. */
export const EPIC_WINDOW_FIELDS: readonly string[] = [
    'schema',
    'tree',
    'origin',
    'epic',
    'from',
    'calls',
    'refusals',
    'reasks',
    'merged',
    'released',
    'stamp',
];

/** Момент окна так, как его пишет пакет: секунды по Гринвичу, доли секунды не обязательны. */
const MOMENT: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

/** Запас на часы машины: штамп дальше него ещё не наступил. */
const AHEAD_MS: number = 86_400_000;

/** Окно, готовое лечь в хранилище: дерево добавляет приём из токена. */
export interface IParsedEpicWindow {
    readonly origin: string;
    readonly epic: number;
    readonly openedAt: Date;
    readonly closedAt: Date | null;
    readonly calls: number;
    readonly refusals: number;
    readonly reasks: number;
    readonly merged: boolean;
    readonly released: boolean;
    readonly mergedAt: Date | null;
    readonly releasedAt: Date | null;
    readonly minutes: number | null;
    readonly stamp: Date;
}

/** Что не сошлось: имя поля. */
export interface IEpicWindowFault {
    readonly field: string;
}

interface IWindowMoments {
    readonly openedAt: Date;
    readonly closedAt: Date | null;
    readonly mergedAt: Date | null;
    readonly releasedAt: Date | null;
    readonly stamp: Date;
}

export function isEpicWindowFault(found: IParsedEpicWindow | IEpicWindowFault): found is IEpicWindowFault {
    return 'field' in found;
}

/** Момент в форме пакета, существующий в календаре: `2026-02-30T…` не принимается. */
function momentOf(value: unknown): Date | null {
    if (typeof value !== 'string' || !MOMENT.test(value)) {
        return null;
    }
    const moment: Date = new Date(value);

    return !Number.isNaN(moment.getTime()) && moment.toISOString().slice(0, 10) === value.slice(0, 10) ? moment : null;
}

function isFlag(value: unknown): boolean {
    return value === 0 || value === 1;
}

function isAbsent(value: unknown): boolean {
    return value === null || value === undefined;
}

/** Необязательный момент: пусто или момент не позже штампа. `undefined` — форма не сошлась. */
function optionalMoment(value: unknown, stamp: Date): Date | null | undefined {
    if (isAbsent(value)) {
        return null;
    }
    const moment: Date | null = momentOf(value);

    return moment && moment <= stamp ? moment : undefined;
}

function numbersFault(body: TCargoBody): IEpicWindowFault | null {
    const epic: unknown = body['epic'];

    if (!Number.isSafeInteger(epic) || Number(epic) <= 0) {
        return { field: 'epic' };
    }
    const wrong: string | undefined = ['calls', 'refusals', 'reasks'].find((field: string): boolean => !isMetricValue(body[field]));

    if (wrong !== undefined) {
        return { field: wrong };
    }
    if (Number(body['refusals']) > Number(body['calls'])) {
        return { field: 'refusals' };
    }
    const flag: string | undefined = ['merged', 'released'].find((field: string): boolean => !isFlag(body[field]));

    if (flag !== undefined) {
        return { field: flag };
    }

    return isAbsent(body['minutes']) || isMetricValue(body['minutes']) ? null : { field: 'minutes' };
}

/** Штамп из будущего закрыл бы окно для всех следующих отправок копии. */
function stampOf(value: unknown, now: Date): Date | null {
    return isMetricValue(value) && Number(value) <= now.getTime() + AHEAD_MS ? new Date(Number(value)) : null;
}

function momentsOf(body: TCargoBody, now: Date): IWindowMoments | IEpicWindowFault {
    const stamp: Date | null = stampOf(body['stamp'], now);

    if (!stamp) {
        return { field: 'stamp' };
    }
    const openedAt: Date | null = momentOf(body['from']);

    if (!openedAt || openedAt > stamp) {
        return { field: 'from' };
    }
    const closedAt: Date | null | undefined = optionalMoment(body['to'], stamp);

    if (closedAt === undefined || (closedAt && closedAt <= openedAt)) {
        return { field: 'to' };
    }
    const mergedAt: Date | null | undefined = optionalMoment(body['mergedAt'], stamp);

    if (mergedAt === undefined) {
        return { field: 'mergedAt' };
    }
    const releasedAt: Date | null | undefined = optionalMoment(body['releasedAt'], stamp);

    return releasedAt === undefined ? { field: 'releasedAt' } : { openedAt, closedAt, mergedAt, releasedAt, stamp };
}

/** Окно эпика или поле, из-за которого оно не принято. */
export function parseEpicWindow(body: TCargoBody, now: Date): IParsedEpicWindow | IEpicWindowFault {
    if (!isMetricOrigin(body['origin'])) {
        return { field: 'origin' };
    }
    const fault: IEpicWindowFault | null = numbersFault(body);

    if (fault) {
        return fault;
    }
    const moments: IWindowMoments | IEpicWindowFault = momentsOf(body, now);

    if ('field' in moments) {
        return moments;
    }

    return {
        ...moments,
        origin: String(body['origin']),
        epic: Number(body['epic']),
        calls: Number(body['calls']),
        refusals: Number(body['refusals']),
        reasks: Number(body['reasks']),
        merged: body['merged'] === 1,
        released: body['released'] === 1,
        minutes: isAbsent(body['minutes']) ? null : Number(body['minutes']),
    };
}
