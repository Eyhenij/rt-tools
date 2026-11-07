/**
 * Итог задачи: главная метрика пакета.
 *
 * Слияние часто идёт в браузере, без сессии, поэтому итог читается позже: `pull-outcomes.sh`
 * спрашивает профиль дерева и добавляет подпись передачи. Здесь факты превращаются в итоги, а
 * файл учтённых заявок не даёт сосчитать одну заявку дважды. В наблюдения уходит только итог:
 * номера заявок и задач остаются в дереве.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { dayBefore, IObservation, KEEP_DAYS, OBSERVATIONS_DIR } from './observations.js';
import { byText } from './order.js';

/** Срок, в который откат или новая заявка той же задачи снимают первую приёмку. */
export const LOST_WITHIN_DAYS: number = 14;

/** С этого числа задач отчёт показывает долю: доля из трёх вводит в заблуждение. */
export const SHARE_FROM_TASKS: number = 10;

/** Сколько ждать хостинга: отчёт не должен висеть на нём. */
const HOSTING_TIMEOUT_MS: number = 120_000;

/** Код, которым `pull-outcomes.sh` говорит «спросить некого». */
const NOBODY_TO_ASK: number = 3;

const COUNTED_FILE: string = 'counted-pulls';

/** День последнего чтения: следующее читает от него, а не весь срок. */
const LAST_READ_FILE: string = 'outcomes-read';

export enum EOutcome {
    FirstPass = 'first-pass',
    Changed = 'changed',
    Closed = 'closed',
    /** Первая приёмка снята откатом или новой заявкой той же задачи. */
    Lost = 'lost',
    /** Заявка не передавалась: подписи нет, в главное число она не входит и называется отдельно. */
    NoHandover = 'no-handover',
}

/** Чем кончилось чтение итогов. Причины разные, и подменять одну другой отчёт не должен. */
export enum EOutcomesRead {
    Read = 'read',
    NobodyToAsk = 'nobody-to-ask',
    Failed = 'failed',
}

export interface ICommitFact {
    readonly sha: string;
    readonly tree: string;
    readonly parents: number;
}

/** Что `pull-outcomes.sh` знает об одной закрытой заявке. */
export interface IPullFact {
    readonly number: number;
    readonly merged: boolean;
    readonly task: number | null;
    readonly revert: boolean;
    readonly epic: boolean;
    /** День закрытия, `ГГГГ-ММ-ДД`. */
    readonly closed: string;
    readonly handover: { readonly commit: string; readonly tree: string } | null;
    /** Правки владельца после передачи. */
    readonly corrections: number;
    /** Коммиты заявки от старых к новым. */
    readonly commits: readonly ICommitFact[];
}

/** Строка файла учтённых заявок. Файл из дерева не уходит. */
export interface ICountedPull {
    readonly number: number;
    readonly task: number | null;
    readonly day: string;
    readonly outcome: EOutcome;
}

/** Итоги за отрезок. Считаются по наблюдениям, поэтому переживают чистку меток. */
export interface IOutcomeMetric {
    readonly accepted: number;
    readonly closed: number;
    /** Первая приёмка за вычетом снятых. */
    readonly firstPass: number;
    /** Откаты и новые заявки той же задачи. */
    readonly lost: number;
    /** Заявки без подписи передачи: они вне главного числа, и их видно отдельно. */
    readonly noHandover: number;
}

/** Менялось ли дерево головы после передачи. Слияние базы изменением не считается. */
export function changedAfterHandover(fact: IPullFact): boolean {
    const tip: ICommitFact | undefined = fact.commits[fact.commits.length - 1];

    if (!fact.handover || !tip) {
        return true;
    }
    if (tip.tree === fact.handover.tree) {
        return false;
    }
    const handed: string = fact.handover.commit;
    const at: number = fact.commits.findIndex((commit: ICommitFact): boolean => commit.sha === handed);

    return at < 0 || fact.commits.slice(at + 1).some((commit: ICommitFact): boolean => commit.parents < 2);
}

/** Итог заявки. `null`: заявка не считается, это эпик или откат. */
export function outcomeOf(fact: IPullFact): EOutcome | null {
    if (fact.epic || fact.revert) {
        return null;
    }
    if (!fact.handover) {
        return EOutcome.NoHandover;
    }
    if (!fact.merged) {
        return EOutcome.Closed;
    }

    return changedAfterHandover(fact) || fact.corrections > 0 ? EOutcome.Changed : EOutcome.FirstPass;
}

/** Задача потеряла первую приёмку этой заявкой: откат или новая заявка той же задачи в срок. */
function lostBy(fact: IPullFact, counted: readonly ICountedPull[]): ICountedPull | null {
    if (fact.task === null || (fact.revert && !fact.merged)) {
        return null;
    }
    const from: string = dayBefore(fact.closed, LOST_WITHIN_DAYS);
    const same: readonly ICountedPull[] = counted.filter((pull: ICountedPull): boolean => pull.task === fact.task);
    // Снимает только заявка, закрытая позже: старая заявка, дочитанная вторым чтением, итог не меняет.
    const passed: boolean = same.some(
        (pull: ICountedPull): boolean =>
            pull.outcome === EOutcome.FirstPass &&
            byText(pull.day, from) >= 0 &&
            byText(pull.day, fact.closed) <= 0 &&
            pull.number < fact.number
    );
    const already: boolean = same.some((pull: ICountedPull): boolean => pull.outcome === EOutcome.Lost);

    return passed && !already ? { number: fact.number, task: fact.task, day: fact.closed, outcome: EOutcome.Lost } : null;
}

function byClosed(left: IPullFact, right: IPullFact): number {
    return left.closed.localeCompare(right.closed) || left.number - right.number;
}

/** Новые строки учёта: каждая заявка считается один раз, порядок задаёт день закрытия. */
export function newOutcomes(facts: readonly IPullFact[], counted: readonly ICountedPull[]): readonly ICountedPull[] {
    const fresh: ICountedPull[] = [];

    for (const fact of [...facts].sort(byClosed)) {
        const known: readonly ICountedPull[] = [...counted, ...fresh];

        if (!known.some((pull: ICountedPull): boolean => pull.number === fact.number)) {
            const lost: ICountedPull | null = lostBy(fact, known);
            const outcome: EOutcome | null = outcomeOf(fact);

            fresh.push(...(lost ? [lost] : []), ...(outcome ? [{ number: fact.number, task: fact.task, day: fact.closed, outcome }] : []));
        }
    }

    return fresh;
}

/** Итоги из наблюдений. `null`: записей нет, и нулём это быть не должно. */
export function outcomeMetricOf(observations: readonly IObservation[]): IOutcomeMetric | null {
    const counts: Map<string, number> = new Map();

    for (const entry of observations) {
        if (entry.event === 'task-outcome') {
            counts.set(entry.resource, (counts.get(entry.resource) ?? 0) + 1);
        }
    }
    if (!counts.size) {
        return null;
    }
    const passed: number = counts.get(EOutcome.FirstPass) ?? 0;
    const lost: number = counts.get(EOutcome.Lost) ?? 0;

    return {
        accepted: passed + (counts.get(EOutcome.Changed) ?? 0),
        closed: counts.get(EOutcome.Closed) ?? 0,
        firstPass: Math.max(passed - lost, 0),
        noHandover: counts.get(EOutcome.NoHandover) ?? 0,
        lost,
    };
}

/** Есть ли чему делить: заявки без подписи главного числа не дают. */
export function hasMainNumber(metric: IOutcomeMetric | null): boolean {
    return metric !== null && metric.accepted + metric.closed > 0;
}

const READ_FAULT: Readonly<Record<EOutcomesRead, string>> = {
    [EOutcomesRead.Read]: '',
    [EOutcomesRead.NobodyToAsk]: 'итоги заявок: спросить некого, в дереве нет функции профиля `rt_pull_outcomes` или клиента хостинга',
    [EOutcomesRead.Failed]: 'итоги заявок: чтение оборвалось, числа ниже могут отставать',
};

/** Итоги словами. До десяти задач стоит счёт, а не доля. Главное число идёт первым в отчёте. */
export function outcomeLines(metric: IOutcomeMetric | null, state: EOutcomesRead, corrections: number): readonly string[] {
    const fault: readonly string[] = READ_FAULT[state] ? [READ_FAULT[state]] : [];
    const apart: readonly string[] = metric?.noHandover ? [`заявок без передачи: ${metric.noHandover}, в главное число они не входят`] : [];

    if (!metric || !hasMainNumber(metric)) {
        return fault.length || apart.length ? ['', ...fault, ...apart] : [];
    }
    const counted: number = metric.accepted + metric.closed;
    const share: string = counted >= SHARE_FROM_TASKS ? ` (${Math.round((metric.firstPass / counted) * 100)}%)` : '';
    const perTask: string = metric.accepted > 0 ? `, на задачу ${(corrections / metric.accepted).toFixed(1)}` : '';

    return [
        '',
        `принято с первого раза: ${metric.firstPass} из ${counted}${share}`,
        `принято задач: ${metric.accepted}, закрыто без слияния: ${metric.closed}, откатов и повторных заявок: ${metric.lost}`,
        `правки владельца: ${corrections}${perTask}`,
        ...apart,
        ...fault,
    ];
}

interface IFactsRead {
    readonly state: EOutcomesRead;
    readonly facts: readonly IPullFact[];
}

/** Причина обрыва чтения: код «спросить некого» отличается от сети и предела времени. */
function faultOf(failure: unknown): IFactsRead {
    const nobody: boolean = failure instanceof Error && Reflect.get(failure, 'status') === NOBODY_TO_ASK;

    return { state: nobody ? EOutcomesRead.NobodyToAsk : EOutcomesRead.Failed, facts: [] };
}

/** Факты с хостинга. Дерево без функции считается отдельно, а не падает. */
function readFacts(root: string, since: string): IFactsRead {
    const path: string = join(root, '.claude', 'hooks', 'pull-outcomes.sh');

    if (!existsSync(path)) {
        return { state: EOutcomesRead.NobodyToAsk, facts: [] };
    }
    try {
        const out: string = execFileSync(path, [since], {
            cwd: root,
            env: { ...process.env, CLAUDE_PROJECT_DIR: root },
            encoding: 'utf8',
            timeout: HOSTING_TIMEOUT_MS,
            stdio: ['ignore', 'pipe', 'ignore'],
        });

        return {
            state: EOutcomesRead.Read,
            facts: out
                .split('\n')
                .filter((line: string): boolean => line.trim() !== '')
                .map((line: string): IPullFact => JSON.parse(line) as IPullFact),
        };
    } catch (failure: unknown) {
        return faultOf(failure);
    }
}

function lastReadPath(root: string): string {
    return join(root, OBSERVATIONS_DIR, '.marks', LAST_READ_FILE);
}

/** С какого дня читать: от прошлого чтения, но не дальше срока хранения. */
function sinceOf(root: string, today: string): string {
    const edge: string = dayBefore(today, KEEP_DAYS);
    const last: string = existsSync(lastReadPath(root)) ? readFileSync(lastReadPath(root), 'utf8').trim() : '';

    return byText(last, edge) > 0 ? last : edge;
}

function countedPath(root: string): string {
    return join(root, OBSERVATIONS_DIR, '.marks', COUNTED_FILE);
}

function parseCounted(line: string): ICountedPull | null {
    const [number, task, day, outcome]: readonly string[] = line.trim().split(' ');

    return number && day && outcome
        ? { day, number: Number(number), task: task === '-' ? null : Number(task), outcome: outcome as EOutcome }
        : null;
}

function readCounted(root: string): readonly ICountedPull[] {
    if (!existsSync(countedPath(root))) {
        return [];
    }

    return readFileSync(countedPath(root), 'utf8')
        .split('\n')
        .map(parseCounted)
        .filter((pull: ICountedPull | null): pull is ICountedPull => pull !== null);
}

/**
 * Читает заявки, закрытые с прошлого чтения, и дописывает новые итоги.
 *
 * Запись идёт из отчёта, а не из проверки: в момент слияния сессии может не быть вовсе.
 */
export function collectOutcomes(root: string, today: string, version: string): EOutcomesRead {
    const { state, facts }: IFactsRead = readFacts(root, sinceOf(root, today));

    if (state !== EOutcomesRead.Read) {
        return state;
    }
    const fresh: readonly ICountedPull[] = newOutcomes(facts, readCounted(root));
    const stamp: string = `${today}T00:00:00Z`;

    mkdirSync(join(root, OBSERVATIONS_DIR, '.marks'), { recursive: true });
    writeFileSync(lastReadPath(root), `${today}\n`);
    for (const pull of fresh) {
        const note: string = JSON.stringify({ t: stamp, ev: 'task-outcome', res: pull.outcome, v: version });

        appendFileSync(countedPath(root), `${pull.number} ${pull.task ?? '-'} ${pull.day} ${pull.outcome}\n`);
        appendFileSync(join(root, OBSERVATIONS_DIR, `${today}.jsonl`), `${note}\n`);
    }

    return EOutcomesRead.Read;
}
