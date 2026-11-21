/**
 * Результат работы в отчёте метрик: строки считает `checks/work-result.mjs` теми же функциями, что
 * хук конца хода и чтение слияний. Отчёт только зовёт его и вставляет строку, которую считают итоги
 * заявок.
 */
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import { OBSERVATIONS_DIR } from './observations.js';

/** Отказы одной проверки за день. */
export interface IWorkResultCheck {
    readonly refusals: number;
    readonly per100: number;
}

/**
 * Числа одного дня: их несёт JSON отчёта и строка дня. Числа записи хода есть только у дня с записью:
 * ноль там читался бы как спокойный день.
 */
export interface IWorkResultDay {
    readonly day: string;
    readonly recorded: boolean;
    readonly beforeCounter: boolean;
    readonly skipped: number;
    readonly goalNotMet: number;
    readonly tasksMerged: number;
    readonly tasksTimed: number;
    readonly takenMinutes: number;
    readonly calls?: number;
    readonly refusals?: number;
    readonly byKind?: Readonly<Record<string, number>>;
    readonly byCheck?: Readonly<Record<string, IWorkResultCheck>>;
    /** Пары отказов под ключом `первая → вторая`. */
    readonly pairs?: Readonly<Record<string, number>>;
    readonly idleMinutes?: number;
    readonly reasks?: number;
    readonly interrupts?: number;
    readonly ownerWords?: number;
    readonly deadEnds?: number;
}

export interface IWorkResult {
    /** Числа по дням. `null`: подсчёт оборвался, и строки говорят об этом. */
    readonly days: readonly IWorkResultDay[] | null;
    readonly lines: readonly string[];
}

/** Строка, которую считают итоги заявок: без главного числа она печатает «0 из 0». */
export const FIRST_PASS_NONE: string = '  Принято с первого раза: 0 из 0';

/** Сколько строк заголовка стоит до строк чисел: пустая и «результат работы:». */
const HEAD_LINES: number = 2;

/** Ответ сценария больше любого дня записи: один день весит до десятков мегабайт. */
const MAX_BUFFER: number = 256 * 1024 * 1024;

interface IScriptAnswer {
    readonly result: { readonly days: readonly IWorkResultDay[] };
    readonly lines: readonly string[];
}

/**
 * Результат за отрезок. `firstPass` — своя строка «Принято с первого раза» или `null`, когда её
 * уже напечатали итоги заявок.
 */
export function workResultOf(root: string, assetsDir: string, until: string, days: number, firstPass: string | null): IWorkResult {
    try {
        const out: string = execFileSync(
            process.execPath,
            [
                join(assetsDir, 'checks', 'work-result.mjs'),
                '--observations',
                join(root, OBSERVATIONS_DIR),
                '--until',
                until,
                '--days',
                String(days),
            ],
            { encoding: 'utf8', maxBuffer: MAX_BUFFER, stdio: ['ignore', 'pipe', 'pipe'] }
        );
        const answer: IScriptAnswer = JSON.parse(out);
        const head: readonly string[] = answer.lines.slice(0, HEAD_LINES);
        const rest: readonly string[] = answer.lines.slice(HEAD_LINES);

        return { days: answer.result.days, lines: [...head, ...(firstPass === null ? [] : [firstPass]), ...rest] };
    } catch {
        return { days: null, lines: ['', 'результат работы: подсчёт оборвался, числа результата не показаны'] };
    }
}
