/**
 * Строка дня: числа одной копии за один день.
 *
 * Счёт берётся у отчёта, а не повторяется здесь: два счёта одного числа разошлись бы молча. Имена
 * ресурсов судит отправитель: у приёмника список имён отстаёт от пакета, и судить он может только
 * форму. Имя, которого пакет не везёт, уходит постоянным словом, как и в грузе наблюдений.
 */
import { IAsset } from './assets.js';
import { isMetricKey, isMetricValue } from './cargo.js';
import { ICallMetric, IUsageMetric, usageOf } from './metric-usage.js';
import { ITreeFacts } from './metric-send-mark.js';
import { guardsOf, IGuardMetric, IRunMetric, runsOf } from './metrics.js';
import { IObservation } from './observations.js';
import { OWN_RESOURCE, packaged } from './observations-cargo.js';
import { IOutcomeMetric, outcomeMetricOf } from './outcomes.js';
import { IWorkResultCheck, IWorkResultDay } from './work-result.js';

type TMetrics = Record<string, number>;

function add(metrics: TMetrics, key: string, value: number): void {
    if (value > 0) {
        metrics[key] = (metrics[key] ?? 0) + value;
    }
}

function nameOf(name: string, assets: readonly IAsset[]): string {
    return packaged(name, assets) ? name : OWN_RESOURCE;
}

function countOf(observations: readonly IObservation[], event: string): number {
    return observations.filter((entry: IObservation): boolean => entry.event === event).length;
}

function sessionsOf(observations: readonly IObservation[]): number {
    return new Set(observations.map((entry: IObservation): string => entry.session).filter(Boolean)).size;
}

function outcomeNumbers(metrics: TMetrics, outcomes: IOutcomeMetric | null): void {
    if (!outcomes) {
        return;
    }
    add(metrics, 'tasksAccepted', outcomes.accepted);
    add(metrics, 'tasksClosed', outcomes.closed);
    // Откат приходит не в день приёмки, поэтому вычитать его в строке дня нельзя: разность за два дня
    // разошлась бы с разностью за один. Вычитает тот, кто складывает дни.
    add(metrics, 'tasksFirstPass', outcomes.passed);
    add(metrics, 'tasksLost', outcomes.lost);
    add(metrics, 'tasksNoHandover', outcomes.noHandover);
}

function usageNumbers(metrics: TMetrics, usage: IUsageMetric): void {
    add(metrics, 'edits', usage.edits);
    add(metrics, 'editsRefused', usage.editsRefused);
    add(metrics, 'examSessions', usage.examSessions);
    add(metrics, 'examsFirstPass', usage.examsFirstPass);
    add(metrics, 'refusalsWithRule', usage.refusalsWithRule);
}

function guardNumbers(metrics: TMetrics, guards: readonly IGuardMetric[], assets: readonly IAsset[]): void {
    for (const guard of guards) {
        const name: string = nameOf(guard.name, assets);

        add(metrics, `guardRefusals:${name}`, guard.refusals);
        add(metrics, `guardCompared:${name}`, guard.compared);
        add(metrics, `guardEmpty:${name}`, guard.empty);
    }
}

function runNumbers(metrics: TMetrics, runs: readonly IRunMetric[]): void {
    for (const run of runs) {
        add(metrics, `runs:${run.kind}`, run.runs);
        add(metrics, `runSeconds:${run.kind}`, run.seconds);
        add(metrics, `wastedRuns:${run.kind}`, run.wastedRuns);
        add(metrics, `wastedSeconds:${run.kind}`, run.wastedSeconds);
    }
}

/** Вызовы ролей и команд идут разными ключами, а счёт отчёта их складывает: разводит род события. */
function callNumbers(
    metrics: TMetrics,
    observations: readonly IObservation[],
    calls: readonly ICallMetric[],
    assets: readonly IAsset[]
): void {
    for (const entry of observations) {
        if (entry.event === 'role-call') {
            add(metrics, `roleCalls:${nameOf(entry.resource, assets)}`, 1);
        }
        if (entry.event === 'command-call') {
            add(metrics, `commandCalls:${nameOf(entry.resource, assets)}`, 1);
        }
    }
    for (const call of calls) {
        const name: string = nameOf(call.name, assets);

        add(metrics, `roleVerdicts:${name}`, call.verdicts);
        add(metrics, `roleRefused:${name}`, call.refused);
    }
}

function loadNumbers(metrics: TMetrics, observations: readonly IObservation[], usage: IUsageMetric, assets: readonly IAsset[]): void {
    for (const entry of observations) {
        if (entry.event === 'skill-load') {
            add(metrics, `ruleLoads:${nameOf(entry.resource, assets)}`, 1);
        }
        if (entry.event === 'gate-deny') {
            add(metrics, `gateRefusals:${nameOf(entry.resource, assets)}`, 1);
        }
    }
    for (const rule of usage.refusalsAfterLoad) {
        add(metrics, `rulesAfterLoad:${nameOf(rule.name, assets)}`, rule.count);
    }
}

/** Разделитель пары в числах дня: `первая → вторая`. */
const PAIR_SEPARATOR: string = ' → ';

/** Ключ строки дня и поле дня результата, из которого он берётся. */
const RECORD_KEYS: Readonly<Record<string, keyof IWorkResultDay>> = {
    calls: 'calls',
    idleMinutes: 'idleMinutes',
    reasks: 'reasks',
    interrupts: 'interrupts',
    ownerWords: 'ownerWords',
    deadEnds: 'deadEnds',
};

/** Ключ строки дня и класс отказа записи. */
const REFUSAL_CLASS_KEYS: Readonly<Record<string, string>> = {
    refusalsHook: 'hook',
    refusalsPermission: 'permission',
    refusalsStop: 'stop',
};

/** Числа записи хода: только у дня с записью, день до счётчика их не несёт. */
function recordNumbers(metrics: TMetrics, day: IWorkResultDay, assets: readonly IAsset[]): void {
    for (const [key, field] of Object.entries(RECORD_KEYS)) {
        add(metrics, key, Number(day[field] ?? 0));
    }
    for (const [key, kind] of Object.entries(REFUSAL_CLASS_KEYS)) {
        add(metrics, key, day.byKind?.[kind] ?? 0);
    }
    const checks: [string, IWorkResultCheck][] = Object.entries(day.byCheck ?? {});

    for (const [check, counted] of checks) {
        add(metrics, `recordRefusals:${nameOf(check, assets)}`, counted.refusals);
    }
    for (const [pair, count] of Object.entries(day.pairs ?? {})) {
        const [first, second]: string[] = pair.split(PAIR_SEPARATOR);

        add(metrics, `refusalPairs:${nameOf(first, assets)}:${nameOf(second, assets)}`, count);
    }
}

/** Результат работы дня: слияния и вердикты есть у любого дня, числа записи — у дня с записью. */
function resultNumbers(metrics: TMetrics, day: IWorkResultDay, assets: readonly IAsset[]): void {
    add(metrics, 'tasksMerged', day.tasksMerged);
    add(metrics, 'tasksTimed', day.tasksTimed);
    add(metrics, 'takenMinutes', day.takenMinutes);
    add(metrics, 'goalNotMet', day.goalNotMet);
    add(metrics, 'recordLinesSkipped', day.skipped);
    if (day.recorded) {
        recordNumbers(metrics, day, assets);
    }
}

function factNumbers(metrics: TMetrics, facts: ITreeFacts): void {
    add(metrics, 'rulesLaidOut', facts.rulesLaidOut);
    add(metrics, 'rulesDead', facts.rulesDead ?? 0);
    add(metrics, 'sectionsTotal', facts.sectionsTotal);
    add(metrics, 'sectionsOverridden', facts.sectionsOverridden);
    add(metrics, 'entryChars', facts.entryChars ?? 0);
    add(metrics, 'outcomesBroken', facts.outcomesBroken);
    add(metrics, 'outcomesUnread', facts.outcomesUnread);
    add(metrics, 'sendFault', facts.sendFault);
}

/**
 * Числа одного дня. `facts` приходит у сегодняшней строки и у дней, чьи числа хранит метка отправки.
 *
 * Последний фильтр не сторож, а граница: ключ, не прошедший проверку, отказал бы у приёмника всю
 * строку, и один странный род запуска стоил бы дереву целого дня.
 */
export function dayMetrics(
    observations: readonly IObservation[],
    assets: readonly IAsset[],
    facts: ITreeFacts | null,
    result: IWorkResultDay | null = null
): Readonly<TMetrics> {
    const metrics: TMetrics = {};
    const usage: IUsageMetric = usageOf(observations);

    add(metrics, 'sessions', sessionsOf(observations));
    add(metrics, 'ownerCorrections', countOf(observations, 'owner-correction'));
    add(metrics, 'settingsChanged', countOf(observations, 'settings-change'));
    outcomeNumbers(metrics, outcomeMetricOf(observations));
    usageNumbers(metrics, usage);
    guardNumbers(metrics, guardsOf(observations), assets);
    runNumbers(metrics, runsOf(observations));
    callNumbers(metrics, observations, usage.calls, assets);
    loadNumbers(metrics, observations, usage, assets);
    if (facts) {
        factNumbers(metrics, facts);
    }
    if (result) {
        resultNumbers(metrics, result, assets);
    }

    return Object.fromEntries(
        Object.entries(metrics).filter(([key, value]: [string, number]): boolean => isMetricKey(key) && isMetricValue(value))
    );
}
