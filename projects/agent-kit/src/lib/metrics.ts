/**
 * Метрики пакета по наблюдениям одного дерева.
 *
 * Это частичный вид: он считает то, что наблюдения уже знают. Итог задачи, правки владельца и
 * минуты проверок появятся вместе с новыми событиями, и до тех пор отчёт называет их словами
 * «нет данных», а не нулём: ноль здесь читался бы как хороший результат.
 *
 * Пустой отказ требует признака содержимого дерева, которого в наблюдениях ещё нет. Поэтому здесь
 * считается повтор: тот же гард в той же сессии отказал сразу после своего же отказа.
 *
 * Загрузки, отказы шлюза и неиспользованные правила берутся из готовой сводки `summarize`.
 */
import { costOf, CostUnavailableError } from './cost.js';
import { IConfig, readConfig } from './config.js';
import { IEnvironment, IOutcomeOfCommand } from './commands.js';
import { ICount, IObservation, IReadResult, ISummary, readObservations, summarize } from './observations.js';
import { byText } from './order.js';
import { laidOutSkills } from './snapshot.js';

/** Отрезок отчёта, когда он не назван: столько дней наблюдения лежат на диске. */
export const METRICS_DEFAULT_DAYS: number = 30;

/** Сколько строк с худшими ресурсами печатает отчёт. */
const TOP_LINES: number = 8;

/** Отказы одного гарда за отрезок. */
export interface IGuardMetric {
    readonly name: string;
    readonly refusals: number;
    /** Отказы, пришедшие сразу после своего же отказа в той же сессии. */
    readonly repeats: number;
    /** Доля повторов в процентах, целым числом. */
    readonly repeatShare: number;
}

export interface IMetricsReport {
    readonly days: number;
    readonly sessions: number;
    readonly refusals: number;
    readonly refusalsPerSession: number;
    readonly repeats: number;
    readonly repeatShare: number;
    readonly guards: readonly IGuardMetric[];
    readonly gate: readonly ICount[];
    readonly gateRefusals: number;
    readonly rules: number;
    readonly deadRules: readonly string[];
    readonly deadRuleShare: number;
    /** Вес входа сессии в символах. `null`: посчитать было не на чем. */
    readonly entryChars: number | null;
    /** Числа, для которых наблюдений ещё нет: отчёт называет их, а не молчит. */
    readonly noData: readonly string[];
}

export interface IMetricsOptions {
    readonly days: number;
    /** Сегодняшний день, `ГГГГ-ММ-ДД`. Приходит с края: команду со своими часами не проверить. */
    readonly today: string;
    readonly json: boolean;
}

/** Метрики, которые появятся с новыми событиями. */
const NOT_RECORDED_YET: readonly string[] = [
    'Принято с первого раза',
    'Правки владельца',
    'Повторы ошибок',
    'Пустые отказы',
    'Пустые запуски',
    'Экзамены с первого раза',
    'Вызовы ролей и команд',
];

const percent: (part: number, whole: number) => number = (part: number, whole: number): number =>
    whole > 0 ? Math.round((part / whole) * 100) : 0;

const byLoss: (left: IGuardMetric, right: IGuardMetric) => number = (left: IGuardMetric, right: IGuardMetric): number =>
    right.repeats - left.repeats || right.refusals - left.refusals || byText(left.name, right.name);

/**
 * Отказы гардов с повторами.
 *
 * Повтор смотрится внутри сессии: строки соседней сессии между двумя отказами его не прерывают,
 * а любое другое наблюдение той же сессии прерывает. Оно значит, что сессия что-то сделала.
 */
export function guardsOf(observations: readonly IObservation[]): readonly IGuardMetric[] {
    const refusals: Map<string, number> = new Map();
    const repeats: Map<string, number> = new Map();
    const lastOfSession: Map<string, string> = new Map();

    for (const entry of observations) {
        const key: string = entry.event === 'guard-deny' ? `guard-deny:${entry.resource}` : entry.event;

        if (entry.event === 'guard-deny') {
            refusals.set(entry.resource, (refusals.get(entry.resource) ?? 0) + 1);

            if (entry.session !== '' && lastOfSession.get(entry.session) === key) {
                repeats.set(entry.resource, (repeats.get(entry.resource) ?? 0) + 1);
            }
        }

        if (entry.session !== '') {
            lastOfSession.set(entry.session, key);
        }
    }

    return [...refusals]
        .map(([name, count]: [string, number]): IGuardMetric => {
            const repeated: number = repeats.get(name) ?? 0;

            return { name, refusals: count, repeats: repeated, repeatShare: percent(repeated, count) };
        })
        .sort(byLoss);
}

/** Отчёт за отрезок: сводка уже посчитала загрузки, отказы шлюза и неиспользованные правила. */
export function metricsOf(
    observations: readonly IObservation[],
    summary: ISummary,
    rules: number,
    entryChars: number | null
): IMetricsReport {
    const guards: readonly IGuardMetric[] = guardsOf(observations);
    const refusals: number = guards.reduce((sum: number, guard: IGuardMetric): number => sum + guard.refusals, 0);
    const repeats: number = guards.reduce((sum: number, guard: IGuardMetric): number => sum + guard.repeats, 0);

    return {
        refusals,
        repeats,
        guards,
        rules,
        entryChars,
        days: summary.days,
        sessions: summary.sessions,
        refusalsPerSession: summary.sessions > 0 ? Math.round(refusals / summary.sessions) : 0,
        repeatShare: percent(repeats, refusals),
        gate: summary.denials,
        gateRefusals: summary.denials.reduce((sum: number, rule: ICount): number => sum + rule.count, 0),
        deadRules: summary.unused,
        deadRuleShare: percent(summary.unused.length, rules),
        noData: NOT_RECORDED_YET,
    };
}

/** Отчёт словами: сначала то, чего нет, чтобы частичный вид не читался как полный. */
export function metricsLines(report: IMetricsReport): readonly string[] {
    const entry: string = report.entryChars === null ? 'нет данных' : `${report.entryChars} символов`;

    return [
        `метрики дерева за ${report.days} дн.: сессий ${report.sessions}`,
        `нет данных: ${report.noData.join(', ')}`,
        '',
        `отказы проверок: ${report.refusals}, на сессию ${report.refusalsPerSession}`,
        `повторы подряд: ${report.repeats} (${report.repeatShare}%)`,
        ...report.guards
            .slice(0, TOP_LINES)
            .map((guard: IGuardMetric): string => `  ${guard.name}: ${guard.refusals}, повторов ${guard.repeats} (${guard.repeatShare}%)`),
        '',
        `отказы шлюза правил: ${report.gateRefusals}`,
        ...report.gate.slice(0, TOP_LINES).map((rule: ICount): string => `  ${rule.name}: ${rule.count}`),
        '',
        `мёртвые правила: ${report.deadRules.length} из ${report.rules} (${report.deadRuleShare}%)`,
        ...report.deadRules.slice(0, TOP_LINES).map((name: string): string => `  ${name}`),
        '',
        `вес входа: ${entry}`,
    ];
}

/** Вес входа, если дереву есть что взвешивать: без него отчёт всё равно нужен. */
function entryCharsOf(root: string): number | null {
    try {
        return costOf(root, null).entry.chars;
    } catch (failure: unknown) {
        if (failure instanceof CostUnavailableError) {
            return null;
        }
        throw failure;
    }
}

/** Команда `agent-kit metrics`: частичный вид одного дерева. */
export function metrics(env: IEnvironment, options: IMetricsOptions): IOutcomeOfCommand {
    const config: IConfig | null = readConfig(env.root);

    if (!config) {
        return { code: 1, lines: ['конфига дерева нет: сначала `agent-kit init`'] };
    }

    if (!config.observe) {
        return { code: 0, lines: ['запись наблюдений выключена ключом `observe`: считать не по чему'] };
    }

    const result: IReadResult = readObservations(env.root, options.today, options.days);
    const known: readonly string[] = laidOutSkills(config, env.assetsDir);
    const summary: ISummary = summarize(result.observations, known, options.days);
    const report: IMetricsReport = metricsOf(result.observations, summary, known.length, entryCharsOf(env.root));

    return { code: 0, lines: options.json ? [JSON.stringify(report)] : metricsLines(report) };
}
