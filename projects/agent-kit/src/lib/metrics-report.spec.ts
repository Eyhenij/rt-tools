/**
 * Подсчёт отчёта метрик по готовым наблюдениям: отказы, повторы, запуски, строки отчёта. Команда на
 * диске дерева — `metrics.spec.ts`.
 *
 * Сценарии `docs/specs/agent-kit/metrics/`.
 */
import { IGuardMetric, IMetricsReport, IRunMetric, guardsOf, metricsLines, metricsOf, runsOf } from './metrics.js';
import { IObservation, IReadResult, ISummary, summarize } from './observations.js';

const TODAY: string = '2026-08-12';

function line(event: string, resource: string, session: string): IObservation {
    return { event, resource, kind: '', session, version: '0.34.0' };
}

/** Первый день полного отрезка до сегодняшнего включительно. */
const FIRST_OF_FULL_PERIOD: string = '2026-07-14';

function readOf(observations: readonly IObservation[]): IReadResult {
    return { observations, swept: [], silent: false, daysRead: [FIRST_OF_FULL_PERIOD, TODAY] };
}

function reportOf(observations: readonly IObservation[], known: readonly string[]): IMetricsReport {
    const summary: ISummary = summarize(observations, known, 30);

    return metricsOf(readOf(observations), summary, known.length, 1200, TODAY);
}

describe('guardsOf', () => {
    it('SC-AK-1292 — отказ сразу после своего же отказа в той же сессии считается повтором', () => {
        const guards: readonly IGuardMetric[] = guardsOf([
            line('guard-deny', 'turn-exit-guard', 's1'),
            line('guard-deny', 'turn-exit-guard', 's1'),
            line('guard-deny', 'turn-exit-guard', 's1'),
        ]);

        expect(guards).toEqual([{ name: 'turn-exit-guard', refusals: 3, repeats: 2, repeatShare: 67, compared: 0, empty: 0 }]);
    });

    it('SC-AK-1292 — строка соседней сессии повтор не прерывает', () => {
        const guards: readonly IGuardMetric[] = guardsOf([
            line('guard-deny', 'grill-gate', 's1'),
            line('skill-load', 'testing', 's2'),
            line('guard-deny', 'grill-gate', 's1'),
        ]);

        expect(guards[0].repeats).toBe(1);
    });

    it('SC-AK-1292 — другое наблюдение той же сессии повтор прерывает', () => {
        const guards: readonly IGuardMetric[] = guardsOf([
            line('guard-deny', 'grill-gate', 's1'),
            line('skill-load', 'testing', 's1'),
            line('guard-deny', 'grill-gate', 's1'),
        ]);

        // положительная пара к нулю: оба отказа посчитаны, а повтора нет
        expect(guards[0].refusals).toBe(2);
        expect(guards[0].repeats).toBe(0);
    });

    it('SC-AK-1292 — отказ другого гарда повтор прерывает, а строка без сессии повтором не считается', () => {
        const guards: readonly IGuardMetric[] = guardsOf([
            line('guard-deny', 'grill-gate', 's1'),
            line('guard-deny', 'claim-guard', 's1'),
            line('guard-deny', 'grill-gate', 's1'),
            line('guard-deny', 'prose-style-guard', ''),
            line('guard-deny', 'prose-style-guard', ''),
        ]);

        expect(guards.map((guard: IGuardMetric): number => guard.repeats)).toEqual([0, 0, 0]);
    });

    it('SC-AK-1292 — худший по повторам стоит первым', () => {
        const guards: readonly IGuardMetric[] = guardsOf([
            line('guard-deny', 'grill-gate', 's1'),
            line('guard-deny', 'claim-guard', 's2'),
            line('guard-deny', 'claim-guard', 's2'),
        ]);

        expect(guards.map((guard: IGuardMetric): string => guard.name)).toEqual(['claim-guard', 'grill-gate']);
    });
});

describe('metricsOf', () => {
    it('SC-AK-1292 — считает отказы, повторы, отказы шлюза и мёртвые правила', () => {
        const report: IMetricsReport = reportOf(
            [
                line('skill-load', 'testing', 's1'),
                line('gate-deny', 'doc-style', 's1'),
                line('guard-deny', 'grill-gate', 's1'),
                line('guard-deny', 'grill-gate', 's1'),
            ],
            ['testing', 'doc-style', 'lists', 'mockups']
        );

        expect(report.sessions).toBe(1);
        expect(report.refusals).toBe(2);
        expect(report.refusalsPerSession).toBe(2);
        expect(report.repeats).toBe(1);
        expect(report.repeatShare).toBe(50);
        expect(report.gateRefusals).toBe(1);
        expect(report.deadRules).toEqual(['doc-style', 'lists', 'mockups']);
        expect(report.deadRuleShare).toBe(75);
        expect(report.entryChars).toBe(1200);
    });

    it('SC-AK-1292 — пустой отрезок не делит на ноль', () => {
        const report: IMetricsReport = reportOf([], []);

        expect(report.refusalsPerSession).toBe(0);
        expect(report.repeatShare).toBe(0);
        expect(report.deadRuleShare).toBe(0);
    });
});

describe('пустые отказы', () => {
    function refused(guard: string, empty: boolean | null): IObservation {
        return { ...line('guard-deny', guard, 's1'), empty };
    }

    it('SC-AK-1277 — пустые отказы считаются по каждой проверке', () => {
        const report: IMetricsReport = reportOf(
            [refused('grill-gate', false), refused('grill-gate', true), refused('claim-guard', false)],
            ['testing']
        );

        expect(report.guards.find((guard: IGuardMetric): boolean => guard.name === 'grill-gate')).toMatchObject({ compared: 2, empty: 1 });
        expect(report.emptyRefusals).toBe(1);
        expect(report.comparedRefusals).toBe(3);
        expect(metricsLines(report)).toContain('пустые отказы: 1 (33%)');
        expect(metricsLines(report)).toContain('  grill-gate: 2, повторов 1 (50%), пустых 1 (50%)');
    });

    it('SC-AK-1277 — метрика уходит из строки без данных с первой записью с признаком', () => {
        const noData: string | undefined = metricsLines(reportOf([refused('grill-gate', false)], ['testing'])).find(
            (text: string): boolean => text.startsWith('нет данных:')
        );

        expect(noData).toContain('Пустые запуски');
        expect(noData).not.toContain('Пустые отказы');
    });

    it('SC-AK-1277 — записи старой версии не считаются нулём', () => {
        const lines: readonly string[] = metricsLines(reportOf([refused('grill-gate', null)], ['testing']));

        expect(lines.find((text: string): boolean => text.startsWith('нет данных:'))).toContain('Пустые отказы');
        expect(lines).toContain('отказы проверок: 1, на сессию 1');
        expect(lines.join('\n')).not.toContain('пустые отказы:');
    });
});

describe('запуски', () => {
    function run(kind: string, seconds: number, wasted: number | null): IObservation {
        return { event: 'run', resource: 'red', kind, session: '', version: '0.34.0', seconds, wasted };
    }

    it('SC-AK-1279 — минуты красного запуска считаются потерянными для его рода шага', () => {
        const runs: readonly IRunMetric[] = runsOf([run('e2e', 240, null), run('e2e', 180, 240), run('tests', 60, null)]);

        expect(runs).toEqual([
            { kind: 'e2e', runs: 2, seconds: 420, wastedRuns: 1, wastedSeconds: 240 },
            { kind: 'tests', runs: 1, seconds: 60, wastedRuns: 0, wastedSeconds: 0 },
        ]);
    });

    it('SC-AK-1279 — ноль секунд потерянного запуска всё равно считается запуском', () => {
        expect(runsOf([run('check', 0, 0)])[0]).toMatchObject({ wastedRuns: 1, wastedSeconds: 0 });
    });

    it('SC-AK-1279 — отчёт показывает минуты и снимает метрику со строки без данных', () => {
        const lines: readonly string[] = metricsLines(reportOf([run('e2e', 240, null), run('e2e', 180, 240)], ['testing']));

        expect(lines).toContain('запуски: 2, минут 7');
        expect(lines).toContain('пустые запуски: 1, минут 4');
        expect(lines).toContain('  e2e: 2, минут 7, пустых 1, минут 4');
        expect(lines.find((text: string): boolean => text.startsWith('нет данных:'))).toContain('Экзамены с первого раза');
        expect(lines.find((text: string): boolean => text.startsWith('нет данных:'))).not.toContain('Пустые запуски');
    });

    it('SC-AK-1279 — без записей о запусках их строк в отчёте нет', () => {
        const lines: readonly string[] = metricsLines(reportOf([line('guard-deny', 'grill-gate', 's1')], ['testing']));

        expect(lines).toContain('отказы проверок: 1, на сессию 1');
        expect(lines.join('\n')).not.toContain('запуски:');
    });
});

describe('правки владельца', () => {
    it('SC-AK-1290 — отчёт считает правки, а их строку печатает результат работы', () => {
        const counted: IMetricsReport = reportOf([line('owner-correction', '', 's1'), line('owner-correction', '', 's2')], ['testing']);
        const lines: readonly string[] = metricsLines(counted);

        expect(counted.corrections).toBe(2);
        expect(lines.find((text: string): boolean => text.startsWith('нет данных:'))).toContain('Экзамены с первого раза');
        expect(lines.find((text: string): boolean => text.startsWith('нет данных:'))).not.toContain('Правки владельца');
    });
});

describe('metricsLines', () => {
    it('SC-AK-1293 — отчёт называет метрики без данных словами, а не нулём', () => {
        const lines: readonly string[] = metricsLines(reportOf([line('guard-deny', 'grill-gate', 's1')], ['testing']));
        const noData: string | undefined = lines.find((text: string): boolean => text.startsWith('нет данных:'));

        // положительная пара: посчитанное в отчёте стоит рядом
        expect(lines).toContain('отказы проверок: 1, на сессию 1');
        expect(noData).toContain('Экзамены с первого раза');
        expect(noData).toContain('Пустые запуски');
        expect(noData).toContain('Отказы после загрузки правила');
        expect(noData).toContain('Доля правок до загрузки правила');
        // SC-AK-1627: эту строку печатает результат работы числом, «нет данных» её не называет
        expect(noData).not.toContain('Принято с первого раза');
    });

    it('SC-AK-1293 — вес входа без данных назван словами', () => {
        const observations: readonly IObservation[] = [line('skill-load', 'testing', 's1')];
        const report: IMetricsReport = metricsOf(readOf(observations), summarize(observations, ['testing'], 30), 1, null, TODAY);

        expect(metricsLines(report)).toContain('вес входа: нет данных');
    });
});
