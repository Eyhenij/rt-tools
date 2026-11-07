/**
 * Как используется слой правил: вызовы ролей и команд, экзамены, отказы после загрузки правила и
 * правки, встретившие незагруженное правило.
 *
 * Отчёт называет число только там, где записи есть: ноль без записей читался бы как хороший
 * результат.
 */
import { ICount, IObservation } from './observations.js';
import { byText } from './order.js';

/** Вызовы одной роли или команды. */
export interface ICallMetric {
    readonly name: string;
    readonly calls: number;
    /** Вызовы с приговором: роль без него считается только вызовами. */
    readonly verdicts: number;
    readonly refused: number;
}

export interface IUsageMetric {
    readonly calls: readonly ICallMetric[];
    /** Сессии с экзаменом и те из них, где первый приговор был «сдано». */
    readonly examSessions: number;
    readonly examsFirstPass: number;
    /** Отказы проверки, чьё правило уже загружено в этой сессии: его текст ничему не научил. */
    readonly refusalsAfterLoad: readonly ICount[];
    /** Сколько отказов проверок вообще объявили правило: без них число выше не значит ничего. */
    readonly refusalsWithRule: number;
    readonly edits: number;
    readonly editsRefused: number;
}

const KINDS_OF_CALLS: readonly string[] = ['role-call', 'command-call'];

/** Роды шлюза, которые не про правку файла: в долю правок они не входят. */
const NOT_AN_EDIT: readonly string[] = ['command', 'browser', 'design'];

function callsOf(observations: readonly IObservation[]): readonly ICallMetric[] {
    const calls: Map<string, ICallMetric> = new Map();

    for (const entry of observations.filter((one: IObservation): boolean => KINDS_OF_CALLS.includes(one.event))) {
        const seen: ICallMetric = calls.get(entry.resource) ?? { name: entry.resource, calls: 0, verdicts: 0, refused: 0 };

        calls.set(entry.resource, {
            ...seen,
            calls: seen.calls + 1,
            verdicts: seen.verdicts + (entry.verdict ? 1 : 0),
            refused: seen.refused + (entry.verdict === 'refused' ? 1 : 0),
        });
    }

    return [...calls.values()].sort(
        (left: ICallMetric, right: ICallMetric): number => right.calls - left.calls || byText(left.name, right.name)
    );
}

/** Первый приговор каждой сессии: по порядку записи. */
function examsOf(observations: readonly IObservation[]): { readonly sessions: number; readonly firstPass: number } {
    const first: Map<string, string> = new Map();

    for (const entry of observations) {
        if (entry.event === 'exam-verdict' && !first.has(entry.session)) {
            first.set(entry.session, entry.resource);
        }
    }

    return { sessions: first.size, firstPass: [...first.values()].filter((verdict: string): boolean => verdict === 'passed').length };
}

function refusalsAfterLoad(observations: readonly IObservation[]): readonly ICount[] {
    const loaded: Set<string> = new Set();
    const counts: Map<string, number> = new Map();

    for (const entry of observations) {
        if (entry.event === 'skill-load') {
            loaded.add(`${entry.session} ${entry.resource}`);
        }
        if (entry.event === 'guard-deny' && entry.rule && loaded.has(`${entry.session} ${entry.rule}`)) {
            counts.set(entry.rule, (counts.get(entry.rule) ?? 0) + 1);
        }
    }

    return [...counts]
        .map(([name, count]: [string, number]): ICount => ({ name, count }))
        .sort((left: ICount, right: ICount): number => right.count - left.count || byText(left.name, right.name));
}

export function usageOf(observations: readonly IObservation[]): IUsageMetric {
    const exams: { readonly sessions: number; readonly firstPass: number } = examsOf(observations);

    return {
        calls: callsOf(observations),
        examSessions: exams.sessions,
        examsFirstPass: exams.firstPass,
        refusalsAfterLoad: refusalsAfterLoad(observations),
        refusalsWithRule: observations.filter((entry: IObservation): boolean => entry.event === 'guard-deny' && Boolean(entry.rule)).length,
        edits: observations.filter((entry: IObservation): boolean => entry.event === 'edit-seen').length,
        editsRefused: observations.filter(
            (entry: IObservation): boolean => entry.event === 'gate-deny' && !NOT_AN_EDIT.includes(entry.kind)
        ).length,
    };
}

/** Имена метрик, которым уже есть записи: их не называет строка без данных. */
export function usageCounted(usage: IUsageMetric): readonly (string | false)[] {
    return [
        usage.calls.length > 0 && 'Вызовы ролей и команд',
        usage.calls.some((call: ICallMetric): boolean => call.verdicts > 0) && 'Доля работы, отказанной ролью',
        usage.examSessions > 0 && 'Экзамены с первого раза',
        usage.refusalsWithRule > 0 && 'Отказы после загрузки правила',
        usage.edits > 0 && 'Доля правок до загрузки правила',
    ];
}

const share: (part: number, whole: number) => number = (part: number, whole: number): number =>
    whole > 0 ? Math.round((part / whole) * 100) : 0;

function callLine(call: ICallMetric): string {
    return call.verdicts > 0
        ? `  ${call.name}: ${call.calls}, отказано ${call.refused} из ${call.verdicts} (${share(call.refused, call.verdicts)}%)`
        : `  ${call.name}: ${call.calls}`;
}

/** Строки отчёта. Нет записей: строки нет, о ней говорит строка без данных. */
export function usageLines(usage: IUsageMetric, top: (lines: readonly string[]) => readonly string[]): readonly string[] {
    const after: number = usage.refusalsAfterLoad.reduce((sum: number, rule: ICount): number => sum + rule.count, 0);

    return [
        ...(usage.calls.length ? ['', 'вызовы ролей и команд:', ...top(usage.calls.map(callLine))] : []),
        ...(usage.examSessions ? ['', `экзамены с первого раза: ${usage.examsFirstPass} из ${usage.examSessions}`] : []),
        ...(usage.refusalsWithRule
            ? [
                  '',
                  `отказы после загрузки правила: ${after} из ${usage.refusalsWithRule}`,
                  ...top(usage.refusalsAfterLoad.map((rule: ICount): string => `  ${rule.name}: ${rule.count}`)),
              ]
            : []),
        ...(usage.edits
            ? ['', `правки до загрузки правила: ${usage.editsRefused} из ${usage.edits} (${share(usage.editsRefused, usage.edits)}%)`]
            : []),
    ];
}
