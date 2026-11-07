/**
 * Метрики пакета по наблюдениям одного дерева.
 *
 * Сценарии договорённости `docs/specs/agent-kit/proposed/metrics/`.
 */
import { IGuardMetric, IMetricsReport, guardsOf, metricsLines, metricsOf } from './metrics.js';
import { IObservation, ISummary, summarize } from './observations.js';

function line(event: string, resource: string, session: string): IObservation {
    return { event, resource, kind: '', session, version: '0.34.0' };
}

function reportOf(observations: readonly IObservation[], known: readonly string[]): IMetricsReport {
    const summary: ISummary = summarize(observations, known, 30);

    return metricsOf(observations, summary, known.length, 1200);
}

describe('guardsOf', () => {
    it('SC-AK-1292 — отказ сразу после своего же отказа в той же сессии считается повтором', () => {
        const guards: readonly IGuardMetric[] = guardsOf([
            line('guard-deny', 'turn-exit-guard', 's1'),
            line('guard-deny', 'turn-exit-guard', 's1'),
            line('guard-deny', 'turn-exit-guard', 's1'),
        ]);

        expect(guards).toEqual([{ name: 'turn-exit-guard', refusals: 3, repeats: 2, repeatShare: 67 }]);
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

describe('metricsLines', () => {
    it('SC-AK-1293 — отчёт называет метрики без данных словами, а не нулём', () => {
        const lines: readonly string[] = metricsLines(reportOf([line('guard-deny', 'grill-gate', 's1')], ['testing']));
        const noData: string | undefined = lines.find((text: string): boolean => text.startsWith('нет данных:'));

        // положительная пара: посчитанное в отчёте стоит рядом
        expect(lines).toContain('отказы проверок: 1, на сессию 1');
        expect(noData).toContain('Принято с первого раза');
        expect(noData).toContain('Пустые запуски');
        expect(lines.join('\n')).not.toContain('Принято с первого раза: 0');
    });

    it('SC-AK-1293 — вес входа без данных назван словами', () => {
        const observations: readonly IObservation[] = [line('skill-load', 'testing', 's1')];
        const report: IMetricsReport = metricsOf(observations, summarize(observations, ['testing'], 30), 1, null);

        expect(metricsLines(report)).toContain('вес входа: нет данных');
    });
});
