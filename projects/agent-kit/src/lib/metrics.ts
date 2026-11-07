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
import { IEnvironment, IOutcomeOfCommand, noObservationLines, sweptLine } from './commands.js';
import { dayBefore, ICount, IObservation, IReadResult, ISummary, readObservations, summarize } from './observations.js';
import { byText } from './order.js';
import { laidOutSkills } from './snapshot.js';

/** Отрезок отчёта, когда он не назван: столько дней наблюдения лежат на диске. */
export const METRICS_DEFAULT_DAYS: number = 30;

/** Сколько строк с худшими ресурсами печатает отчёт. */
const TOP_LINES: number = 8;

/** На столько дней первая запись может опоздать к началу отрезка: в первые дни дерево могло простаивать. */
const FIRST_RECORD_SLACK_DAYS: number = 7;

/** Отказы одного гарда за отрезок. */
export interface IGuardMetric {
    readonly name: string;
    readonly refusals: number;
    /** Отказы, пришедшие сразу после своего же отказа в той же сессии. */
    readonly repeats: number;
    /** Доля повторов в процентах, целым числом. */
    readonly repeatShare: number;
    /** Отказы, записанные с признаком пустого: записи старых версий его не несут. */
    readonly compared: number;
    /** Отказы на том же вызове и том же содержимом. */
    readonly empty: number;
}

export interface IMetricsReport {
    readonly days: number;
    /** Записи не велось ни разу: нули отчёта ничего не значат. */
    readonly silent: boolean;
    /** Дни, за которые файл нашёлся: запрошенный отрезок бывает длиннее срока хранения. */
    readonly daysRead: readonly string[];
    /** Файлы, снятые чтением по сроку хранения. */
    readonly swept: readonly string[];
    readonly sessions: number;
    readonly refusals: number;
    readonly refusalsPerSession: number;
    readonly repeats: number;
    readonly repeatShare: number;
    readonly guards: readonly IGuardMetric[];
    /** Отказы с признаком пустого. Ноль: сравнивать ещё не с чем, и строки в отчёте нет. */
    readonly comparedRefusals: number;
    readonly emptyRefusals: number;
    readonly gate: readonly ICount[];
    readonly gateRefusals: number;
    readonly rules: number;
    /** `null`: записи не покрывают полный отрезок, и не загруженным выглядит почти всё. */
    readonly deadRules: readonly string[] | null;
    readonly deadRuleShare: number | null;
    /** Вес входа сессии в символах. `null`: посчитать было не на чем. */
    readonly entryChars: number | null;
    /** Числа, для которых наблюдений ещё нет: отчёт называет их, а не молчит. */
    readonly noData: readonly string[];
    /** Числа, которые считает только отчёт по всем приложениям. */
    readonly outside: readonly string[];
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
    'Отказы после загрузки правила',
    'Доля правок до загрузки правила',
    'Пустые отказы',
    'Пустые запуски',
    'Экзамены с первого раза',
    'Вызовы ролей и команд',
    'Доля работы, отказанной ролью',
];

/** Метрики, которые считает только отчёт по всем приложениям. */
const OUTSIDE_THE_TREE: readonly string[] = ['Повторы ошибок', 'Полнота отчёта', 'Выпуск'];

const percent: (part: number, whole: number) => number = (part: number, whole: number): number =>
    whole > 0 ? Math.round((part / whole) * 100) : 0;

const byRepeats: (left: IGuardMetric, right: IGuardMetric) => number = (left: IGuardMetric, right: IGuardMetric): number =>
    right.repeats - left.repeats || right.refusals - left.refusals || byText(left.name, right.name);

/** Один к счёту имени, если случай состоялся. */
function tally(counts: Map<string, number>, name: string, happened: boolean): void {
    if (happened) {
        counts.set(name, (counts.get(name) ?? 0) + 1);
    }
}

/**
 * Отказы гардов с повторами.
 *
 * Повтор смотрится внутри сессии: строки соседней сессии между двумя отказами его не прерывают,
 * а любое другое наблюдение той же сессии прерывает. Оно значит, что сессия что-то сделала.
 */
export function guardsOf(observations: readonly IObservation[]): readonly IGuardMetric[] {
    const refusals: Map<string, number> = new Map();
    const repeats: Map<string, number> = new Map();
    const compared: Map<string, number> = new Map();
    const empties: Map<string, number> = new Map();
    const lastOfSession: Map<string, string> = new Map();

    for (const entry of observations) {
        const key: string = entry.event === 'guard-deny' ? `guard-deny:${entry.resource}` : entry.event;

        if (entry.event === 'guard-deny') {
            tally(refusals, entry.resource, true);
            tally(repeats, entry.resource, entry.session !== '' && lastOfSession.get(entry.session) === key);
            tally(compared, entry.resource, typeof entry.empty === 'boolean');
            tally(empties, entry.resource, entry.empty === true);
        }

        if (entry.session !== '') {
            lastOfSession.set(entry.session, key);
        }
    }

    return [...refusals]
        .map(([name, count]: [string, number]): IGuardMetric => {
            const repeated: number = repeats.get(name) ?? 0;

            return {
                name,
                refusals: count,
                repeats: repeated,
                repeatShare: percent(repeated, count),
                compared: compared.get(name) ?? 0,
                empty: empties.get(name) ?? 0,
            };
        })
        .sort(byRepeats);
}

/** Покрывают ли записи полный отрезок: только тогда незагруженное правило считается мёртвым. */
function coversFullPeriod(read: IReadResult, days: number, today: string): boolean {
    const edge: string = dayBefore(today, METRICS_DEFAULT_DAYS - 1 - FIRST_RECORD_SLACK_DAYS);

    return days >= METRICS_DEFAULT_DAYS && read.daysRead.length > 0 && byText(read.daysRead[0], edge) <= 0;
}

/** Отчёт за отрезок: сводка уже посчитала загрузки, отказы шлюза и неиспользованные правила. */
export function metricsOf(read: IReadResult, summary: ISummary, rules: number, entryChars: number | null, today: string): IMetricsReport {
    const guards: readonly IGuardMetric[] = guardsOf(read.observations);
    const full: boolean = coversFullPeriod(read, summary.days, today);
    const refusals: number = guards.reduce((sum: number, guard: IGuardMetric): number => sum + guard.refusals, 0);
    const repeats: number = guards.reduce((sum: number, guard: IGuardMetric): number => sum + guard.repeats, 0);
    const comparedRefusals: number = guards.reduce((sum: number, guard: IGuardMetric): number => sum + guard.compared, 0);

    return {
        refusals,
        repeats,
        guards,
        comparedRefusals,
        rules,
        entryChars,
        days: summary.days,
        silent: read.silent,
        daysRead: read.daysRead,
        swept: read.swept,
        sessions: summary.sessions,
        emptyRefusals: guards.reduce((sum: number, guard: IGuardMetric): number => sum + guard.empty, 0),
        refusalsPerSession: summary.sessions > 0 ? Math.round(refusals / summary.sessions) : 0,
        repeatShare: percent(repeats, refusals),
        gate: summary.denials,
        gateRefusals: summary.denials.reduce((sum: number, rule: ICount): number => sum + rule.count, 0),
        deadRules: full ? summary.unused : null,
        deadRuleShare: full ? percent(summary.unused.length, rules) : null,
        noData: NOT_RECORDED_YET.filter((name: string): boolean => name !== 'Пустые отказы' || comparedRefusals === 0),
        outside: OUTSIDE_THE_TREE,
    };
}

/** Первые строки списка и счёт остальных: обрезанный список не должен читаться как полный. */
function topLines(lines: readonly string[]): readonly string[] {
    const rest: number = lines.length - TOP_LINES;

    return [...lines.slice(0, TOP_LINES), ...(rest > 0 ? [`  и ещё ${rest}`] : [])];
}

/** Мёртвые правила словами: без полного отрезка вместо числа стоит причина. */
function deadRuleLines(report: IMetricsReport): readonly string[] {
    if (report.deadRules === null) {
        return [`мёртвые правила: нет данных, они считаются за ${METRICS_DEFAULT_DAYS} дн. записей`];
    }

    return [
        `мёртвые правила: ${report.deadRules.length} из ${report.rules} (${report.deadRuleShare}%)`,
        ...topLines(report.deadRules.map((name: string): string => `  ${name}`)),
    ];
}

/** Хвост строки проверки: без записей с признаком он молчит, а не показывает ноль. */
function emptyOfGuard(guard: IGuardMetric): string {
    return guard.compared > 0 ? `, пустых ${guard.empty} (${percent(guard.empty, guard.compared)}%)` : '';
}

/** Отчёт словами: сначала то, чего нет, чтобы частичный вид не читался как полный. */
export function metricsLines(report: IMetricsReport): readonly string[] {
    const entry: string = report.entryChars === null ? 'нет данных' : `${report.entryChars} символов`;

    return [
        `метрики дерева за ${report.days} дн.: сессий ${report.sessions}`,
        `прочитано дней: ${report.daysRead.length}, с ${report.daysRead[0]} по ${report.daysRead[report.daysRead.length - 1]}`,
        `нет данных: ${report.noData.join(', ')}`,
        `вне этого отчёта: ${report.outside.join(', ')}`,
        '',
        `отказы проверок: ${report.refusals}, на сессию ${report.refusalsPerSession}`,
        `повторы подряд: ${report.repeats} (${report.repeatShare}%)`,
        ...(report.comparedRefusals === 0
            ? []
            : [`пустые отказы: ${report.emptyRefusals} (${percent(report.emptyRefusals, report.comparedRefusals)}%)`]),
        ...topLines(
            report.guards.map(
                (guard: IGuardMetric): string =>
                    `  ${guard.name}: ${guard.refusals}, повторов ${guard.repeats} (${guard.repeatShare}%)${emptyOfGuard(guard)}`
            )
        ),
        '',
        `отказы шлюза правил: ${report.gateRefusals}`,
        ...topLines(report.gate.map((rule: ICount): string => `  ${rule.name}: ${rule.count}`)),
        '',
        ...deadRuleLines(report),
        '',
        `вес входа: ${entry}`,
        ...(report.swept.length ? ['', sweptLine(report.swept)] : []),
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
        return {
            code: 0,
            lines: [
                options.json
                    ? JSON.stringify({ observe: false, silent: true })
                    : 'запись наблюдений выключена ключом `observe`: считать не по чему',
            ],
        };
    }

    const result: IReadResult = readObservations(env.root, options.today, options.days);
    const known: readonly string[] = laidOutSkills(config, env.assetsDir);
    const summary: ISummary = summarize(result.observations, known, options.days);
    const report: IMetricsReport = metricsOf(result, summary, known.length, entryCharsOf(env.root), options.today);

    if (options.json) {
        return { code: 0, lines: [JSON.stringify(report)] };
    }

    return { code: 0, lines: noObservationLines(result, options.days) ?? metricsLines(report) };
}
