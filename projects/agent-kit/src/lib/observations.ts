/**
 * Наблюдения и сводка по ним.
 *
 * Наблюдения пишет `hooks/observe.sh` — по строке на событие, по файлу на день. Здесь они
 * читаются и сводятся: чем пользовались, чем не пользовались ни разу, обо что спотыкались.
 *
 * Разбор отделён от чтения диска намеренно: сводка — то, ради чего наблюдения ведутся, и
 * проверять её на подложенных файлах значило бы проверять файловую систему.
 *
 * Дата приходит доводом, а не берётся из часов: сводка за отрезок дней иначе не проверяется
 * спекой — вчерашний файл фикстуры завтра оказывается позавчерашним.
 */
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { byText } from './order.js';

/** Куда `observe.sh` пишет наблюдения. Путь от корня дерева. */
export const OBSERVATIONS_DIR: string = '.claude/rt-kit/observations';

/** Сколько дней наблюдения лежат. Каталог, который только растёт, через год перестают открывать. */
export const KEEP_DAYS: number = 30;

/** За сколько дней сводка отвечает, когда отрезок не назван. */
export const DEFAULT_DAYS: number = 3;

/** Роды событий, которые пишут гарды. */
export type TEvent = 'skill-load' | 'gate-deny' | 'guard-deny';

export interface IObservation {
    readonly event: string;
    /** Имя правила или гарда — имя ресурса пакета, и только оно. */
    readonly resource: string;
    /** Род правки: расширение, `command` или `browser`. Пути в наблюдении нет. */
    readonly kind: string;
    /** Признак сессии: считает заходы, имени сессии не выдаёт. */
    readonly session: string;
    readonly version: string;
}

/** Сколько раз что-то встретилось. Порядок — по убыванию, при равенстве по имени. */
export interface ICount {
    readonly name: string;
    readonly count: number;
}

export interface ISummary {
    readonly days: number;
    /** Сколько заходов оставило хоть одно наблюдение. */
    readonly sessions: number;
    readonly loads: readonly ICount[];
    /** Отбития гейта по правилам. */
    readonly denials: readonly ICount[];
    /** Род правки, на котором гейт отбивал. */
    readonly kinds: readonly ICount[];
    readonly guards: readonly ICount[];
    /**
     * Правила, разложенные в дерево и не загруженные за отрезок ни разу. Мёртвый ресурс иначе
     * неотличим от работающего — и это единственная строка сводки, которую нельзя получить из
     * самих наблюдений.
     */
    readonly unused: readonly string[];
    readonly versions: readonly string[];
    readonly total: number;
}

/** Дата файла наблюдений: `2026-08-12.jsonl`. Чужое имя в каталоге не наблюдение. */
const DAY_FILE: RegExp = /^(\d{4}-\d{2}-\d{2})\.jsonl$/;

const dayOf: (name: string) => string | null = (name: string): string | null => DAY_FILE.exec(name)?.[1] ?? null;

/** День, отстоящий от названного на столько-то суток назад. Считается в UTC — как и пишется. */
export function dayBefore(today: string, days: number): string {
    const at: number = Date.parse(`${today}T00:00:00Z`);

    return Number.isNaN(at) ? today : new Date(at - days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Одна строка наблюдения. Битая пропускается молча: наблюдение — побочная запись гарда, и
 * оборванная на полуслове строка не имеет права уронить сводку.
 */
export function parseObservation(line: string): IObservation | null {
    if (!line.trim()) {
        return null;
    }
    try {
        const found: Record<string, unknown> = JSON.parse(line) as Record<string, unknown>;
        const event: unknown = found['ev'];

        return typeof event === 'string' && event
            ? {
                  event,
                  resource: typeof found['res'] === 'string' ? found['res'] : '',
                  kind: typeof found['kind'] === 'string' ? found['kind'] : '',
                  session: typeof found['sid'] === 'string' ? found['sid'] : '',
                  version: typeof found['v'] === 'string' ? found['v'] : '',
              }
            : null;
    } catch {
        return null;
    }
}

export interface IReadResult {
    readonly observations: readonly IObservation[];
    /** Файлы, снятые по сроку хранения: их называют вслух, а не убирают молча. */
    readonly swept: readonly string[];
    /** Каталога нет вовсе — записи не велось ни разу. */
    readonly silent: boolean;
}

/** Раньше ли день черты. Дни записаны `ГГГГ-ММ-ДД`, и порядок строк у них хронологический. */
function isBefore(day: string, edge: string): boolean {
    return byText(day, edge) < 0;
}

/** Записи одного дня из его файла. Строка, которая не разбирается, пропускается молча. */
function observationsOfDay(path: string): readonly IObservation[] {
    const found: IObservation[] = [];

    for (const line of readFileSync(path, 'utf8').split('\n')) {
        const one: IObservation | null = parseObservation(line);

        if (one) {
            found.push(one);
        }
    }

    return found;
}

/**
 * Наблюдения за отрезок и уборка того, что старше срока хранения.
 *
 * Уборка идёт здесь, а не отдельной командой: каталог растёт от работы, а не от запусков, и
 * команда, о которой надо помнить, до второго месяца не доживает.
 */
export function readObservations(root: string, today: string, days: number): IReadResult {
    const dir: string = join(root, OBSERVATIONS_DIR);
    if (!existsSync(dir)) {
        return { observations: [], swept: [], silent: true };
    }

    const since: string = dayBefore(today, days - 1);
    const keepFrom: string = dayBefore(today, KEEP_DAYS);
    const observations: IObservation[] = [];
    const swept: string[] = [];

    for (const name of readdirSync(dir).sort(byText)) {
        const day: string | null = dayOf(name);

        if (!day) {
            continue;
        }

        if (isBefore(day, keepFrom)) {
            rmSync(join(dir, name), { force: true });
            swept.push(name);
        } else if (isBefore(day, since)) {
            // День старше запрошенного отрезка, но моложе черты хранения: файл остаётся лежать,
            // а в этот отчёт не идёт
        } else {
            observations.push(...observationsOfDay(join(dir, name)));
        }
    }

    return { observations, swept, silent: false };
}

const countBy: (values: readonly string[]) => readonly ICount[] = (values: readonly string[]): readonly ICount[] => {
    const counted: Map<string, number> = new Map();
    for (const value of values) {
        if (value) {
            counted.set(value, (counted.get(value) ?? 0) + 1);
        }
    }

    return [...counted]
        .map(([name, count]: [string, number]): ICount => ({ name, count }))
        .sort((left: ICount, right: ICount): number => right.count - left.count || left.name.localeCompare(right.name));
};

const of: (observations: readonly IObservation[], event: TEvent) => readonly IObservation[] = (
    observations: readonly IObservation[],
    event: TEvent
): readonly IObservation[] => observations.filter((entry: IObservation): boolean => entry.event === event);

/**
 * Сводка за отрезок.
 *
 * `known` — имена правил, разложенных в это дерево. Без них сводка отвечает только на вопрос
 * «чем пользовались», а самое ценное — чем не пользовались ни разу — сказать нечем: в самих
 * наблюдениях незагруженного правила нет по определению.
 */
export function summarize(observations: readonly IObservation[], known: readonly string[], days: number): ISummary {
    const loads: readonly IObservation[] = of(observations, 'skill-load');
    const denials: readonly IObservation[] = of(observations, 'gate-deny');
    const loaded: Set<string> = new Set(loads.map((entry: IObservation): string => entry.resource));

    return {
        days,
        sessions: new Set(observations.map((entry: IObservation): string => entry.session).filter(Boolean)).size,
        loads: countBy(loads.map((entry: IObservation): string => entry.resource)),
        denials: countBy(denials.map((entry: IObservation): string => entry.resource)),
        kinds: countBy(denials.map((entry: IObservation): string => entry.kind)),
        guards: countBy(of(observations, 'guard-deny').map((entry: IObservation): string => entry.resource)),
        unused: known.filter((name: string): boolean => !loaded.has(name)).sort(byText),
        versions: [...new Set(observations.map((entry: IObservation): string => entry.version).filter(Boolean))].sort(byText),
        total: observations.length,
    };
}
