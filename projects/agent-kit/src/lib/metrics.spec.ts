/**
 * Метрики пакета по наблюдениям одного дерева.
 *
 * Сценарии договорённости `docs/specs/agent-kit/proposed/metrics/`.
 */
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { IEnvironment, init, IOutcomeOfCommand } from './commands.js';
import { CONFIG_PATH } from './config.js';
import { IGuardMetric, IMetricsReport, IRunMetric, guardsOf, metrics, metricsLines, metricsOf, runsOf } from './metrics.js';
import { IObservation, IReadResult, ISummary, OBSERVATIONS_DIR, summarize } from './observations.js';

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
        expect(lines.find((text: string): boolean => text.startsWith('нет данных:'))).toContain('Принято с первого раза');
        expect(lines.find((text: string): boolean => text.startsWith('нет данных:'))).not.toContain('Пустые запуски');
    });

    it('SC-AK-1279 — без записей о запусках их строк в отчёте нет', () => {
        const lines: readonly string[] = metricsLines(reportOf([line('guard-deny', 'grill-gate', 's1')], ['testing']));

        expect(lines).toContain('отказы проверок: 1, на сессию 1');
        expect(lines.join('\n')).not.toContain('запуски:');
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
        expect(noData).toContain('Отказы после загрузки правила');
        expect(noData).toContain('Доля правок до загрузки правила');
        expect(lines.join('\n')).not.toContain('Принято с первого раза: 0');
    });

    it('SC-AK-1293 — вес входа без данных назван словами', () => {
        const observations: readonly IObservation[] = [line('skill-load', 'testing', 's1')];
        const report: IMetricsReport = metricsOf(readOf(observations), summarize(observations, ['testing'], 30), 1, null, TODAY);

        expect(metricsLines(report)).toContain('вес входа: нет данных');
    });
});

describe('metrics', () => {
    let root: string;
    let env: IEnvironment;

    const observed: (day: string) => void = (day: string): void => {
        const dir: string = join(root, OBSERVATIONS_DIR);
        const text: string = JSON.stringify({ t: `${day}T09:00:00Z`, ev: 'guard-deny', res: 'grill-gate', sid: '1', v: '0.1.0' });

        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, `${day}.jsonl`), `${text}\n`, 'utf8');
    };
    const report: (json?: boolean, days?: number) => IOutcomeOfCommand = (json: boolean = false, days: number = 30): IOutcomeOfCommand =>
        metrics(env, { days, json, today: TODAY });
    const said: (outcome: IOutcomeOfCommand) => string = (outcome: IOutcomeOfCommand): string => outcome.lines.join('\n');

    beforeEach((): void => {
        root = mkdtempSync(join(tmpdir(), 'agent-kit-metrics-'));
        env = { root, version: '0.1.0', assetsDir: join(__dirname, '..', '..', 'assets') };
        init(root, [], { host: 'github' });
    });

    afterEach((): void => {
        rmSync(root, { recursive: true, force: true });
    });

    it('SC-AK-1294 — отчёт называет прочитанные дни, а запрошенный отрезок их не подменяет', () => {
        observed('2026-08-01');
        observed('2026-08-12');

        const text: string = said(report(false, 60));

        expect(text).toContain('метрики дерева за 60 дн.');
        expect(text).toContain('прочитано дней: 2, с 2026-08-01 по 2026-08-12');
    });

    it('SC-AK-1294 — снятые по сроку файлы названы и в тексте, и в JSON', () => {
        observed('2026-06-01');
        observed('2026-08-12');

        expect(said(report())).toContain('снято по сроку хранения (30 дн.): 1');
        expect(readdirSync(join(root, OBSERVATIONS_DIR))).toEqual(['2026-08-12.jsonl']);

        observed('2026-06-02');

        expect(JSON.parse(report(true).lines[0]).swept).toEqual(['2026-06-02.jsonl']);
    });

    it('SC-AK-1294 — без снятых файлов строки о них нет', () => {
        observed('2026-08-12');

        const text: string = said(report());

        // положительная пара: отчёт напечатан, строки нет
        expect(text).toContain('отказы проверок: 1');
        expect(text).not.toContain('снято по сроку');
    });

    it('SC-AK-1295 — записи не велось: причина словами, а не нули', () => {
        const text: string = said(report());

        expect(text).toContain('записи не велось');
        expect(text).not.toContain('отказы проверок: 0');
        expect(text).not.toContain('мёртвые правила');
    });

    it('SC-AK-1295 — записи не велось: JSON говорит об этом полем', () => {
        const parsed: IMetricsReport = JSON.parse(report(true).lines[0]);

        expect(parsed.silent).toBe(true);
        expect(parsed.daysRead).toEqual([]);
    });

    it('SC-AK-1295 — за отрезок пусто, а раньше записи были: так и сказано', () => {
        observed('2026-08-01');

        const text: string = said(report(false, 3));

        expect(text).toContain('записи велись раньше');
        expect(text).not.toContain('отказы проверок: 0');
    });

    it('SC-AK-1295 — выключенная запись названа выключенной', () => {
        const config: Record<string, unknown> = JSON.parse(readFileSync(join(root, CONFIG_PATH), 'utf8'));

        writeFileSync(join(root, CONFIG_PATH), JSON.stringify({ ...config, observe: false }), 'utf8');

        expect(said(report())).toContain('выключена');
        expect(JSON.parse(report(true).lines[0])).toEqual({ observe: false, silent: true });
    });

    it('SC-AK-1295 — за полный срок хранения отчёт не советует отрезок длиннее', () => {
        observed('2026-06-01');

        const text: string = said(report());

        expect(text).toContain('записи велись раньше');
        expect(text).toContain('снято по сроку хранения (30 дн.): 1');
        expect(text).not.toContain('--days');
    });

    it('SC-AK-1293 — за короткий отрезок мёртвые правила не считаются ни в тексте, ни в JSON', () => {
        observed(FIRST_OF_FULL_PERIOD);
        observed(TODAY);

        const parsed: IMetricsReport = JSON.parse(report(true, 3).lines[0]);

        expect(said(report(false, 3))).toContain('мёртвые правила: нет данных, они считаются за 30 дн. записей');
        expect(parsed.deadRules).toBeNull();
        expect(parsed.deadRuleShare).toBeNull();
    });

    it('SC-AK-1293 — дерево записывает недавно: мёртвые правила не считаются за полный отрезок', () => {
        observed('2026-08-10');
        observed(TODAY);

        expect(said(report())).toContain('мёртвые правила: нет данных');
        expect(JSON.parse(report(true).lines[0]).deadRules).toBeNull();
    });

    it('SC-AK-1293 — записи покрывают отрезок: мёртвые правила посчитаны, и простой первых дней не мешает', () => {
        observed('2026-07-20');
        observed(TODAY);

        const parsed: IMetricsReport = JSON.parse(report(true).lines[0]);

        expect(parsed.deadRuleShare).not.toBeNull();
        expect(said(report())).toContain(`мёртвые правила: ${parsed.deadRules?.length} из ${parsed.rules}`);
    });

    it('SC-AK-1293 — отчёт называет метрики, которые считает только общий отчёт', () => {
        observed('2026-08-12');

        expect(said(report())).toContain('вне этого отчёта: Повторы ошибок, Полнота отчёта, Выпуск');
        expect(JSON.parse(report(true).lines[0]).outside).toContain('Повторы ошибок');
    });

    it('SC-AK-1292 — обрезанный список говорит, сколько строк осталось', () => {
        observed(FIRST_OF_FULL_PERIOD);
        observed(TODAY);

        const dead: number = JSON.parse(report(true).lines[0]).deadRules.length;

        expect(dead).toBeGreaterThan(8);
        expect(said(report())).toContain(`  и ещё ${dead - 8}`);
    });

    it('SC-AK-1295 — без конфига отчёт отказывает', () => {
        rmSync(join(root, CONFIG_PATH));

        expect(report().code).toBe(1);
        expect(said(report())).toContain('init');
    });
});
