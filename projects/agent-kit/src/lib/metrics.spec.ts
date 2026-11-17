/**
 * Команда `agent-kit metrics` на диске дерева: отрезок, чтение по сроку хранения, результат работы.
 * Подсчёт отчёта по готовым наблюдениям — `metrics-report.spec.ts`.
 *
 * Сценарии `docs/specs/agent-kit/metrics/` и `docs/specs/agent-kit/proposed/work-result-metrics/`.
 */
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { IEnvironment, init, IOutcomeOfCommand } from './commands.js';
import { CONFIG_PATH } from './config.js';
import { IMetricsReport, metrics } from './metrics.js';
import { OBSERVATIONS_DIR } from './observations.js';

const TODAY: string = '2026-08-12';

/** Первый день полного отрезка до сегодняшнего включительно. */
const FIRST_OF_FULL_PERIOD: string = '2026-07-14';

type TEntry = Record<string, string>;

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

        expect(said(report())).toContain('вне этого отчёта: Повторы ошибок, Полнота отчёта');
        expect(JSON.parse(report(true).lines[0]).outside).toContain('Повторы ошибок');
    });

    it('SC-AK-1292 — обрезанный список говорит, сколько строк осталось', () => {
        observed(FIRST_OF_FULL_PERIOD);
        observed(TODAY);

        const dead: number = JSON.parse(report(true).lines[0]).deadRules.length;

        expect(dead).toBeGreaterThan(8);
        expect(said(report())).toContain(`  и ещё ${dead - 8}`);
    });

    it('SC-AK-1644 — отчёт за названный день считает только его', () => {
        observed('2026-08-11');
        observed('2026-08-12');
        // день после названного лежит на диске и в отчёт не идёт
        observed('2026-08-13');

        const outcome: IOutcomeOfCommand = metrics(env, { days: 30, json: true, today: '2026-08-14', day: '2026-08-12' });
        const parsed: IMetricsReport = JSON.parse(outcome.lines[0]);

        expect(parsed.days).toBe(1);
        expect(parsed.daysRead).toEqual(['2026-08-12']);
        expect(parsed.refusals).toBe(1);
        expect(readdirSync(join(root, OBSERVATIONS_DIR))).toContain('2026-08-11.jsonl');
    });

    it('SC-AK-1295 — без конфига отчёт отказывает', () => {
        rmSync(join(root, CONFIG_PATH));

        expect(report().code).toBe(1);
        expect(said(report())).toContain('init');
    });
});

describe('результат работы в отчёте', () => {
    let root: string;
    let env: IEnvironment;

    const recorded: (day: string, entries: readonly TEntry[]) => void = (day: string, entries: readonly TEntry[]): void => {
        const dir: string = join(root, OBSERVATIONS_DIR);

        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, `${day}.jsonl`), entries.map((entry: TEntry): string => JSON.stringify(entry)).join('\n') + '\n', 'utf8');
    };
    const at: (day: string, second: number) => string = (day: string, second: number): string =>
        new Date(Date.parse(`${day}T09:00:00Z`) + second * 1000).toISOString();
    const calls: (day: string, count: number) => TEntry[] = (day: string, count: number): TEntry[] =>
        Array.from({ length: count }, (_: unknown, i: number): TEntry => ({
            t: at(day, i * 10),
            ev: 'record-call',
            task: 'RT-1',
            sid: 's1',
        }));
    const refusal: (day: string, second: number, check: string) => TEntry = (day: string, second: number, check: string): TEntry => ({
        t: at(day, second),
        ev: 'record-refusal',
        task: 'RT-1',
        kind: 'hook',
        check,
        sid: 's1',
    });
    const verdict: (second: number, fields: TEntry) => TEntry = (second: number, fields: TEntry): TEntry => ({
        t: at(TODAY, second),
        ev: 'role-verdict',
        res: 'goal-critic',
        sid: 's1',
        ...fields,
    });
    const ofDay: (json: boolean) => IOutcomeOfCommand = (json: boolean): IOutcomeOfCommand =>
        metrics(env, { days: 30, json, today: TODAY, day: TODAY });
    const daysOf: (outcome: IOutcomeOfCommand) => readonly Record<string, unknown>[] = (
        outcome: IOutcomeOfCommand
    ): readonly Record<string, unknown>[] => JSON.parse(outcome.lines[0]).result.days;

    beforeEach((): void => {
        root = mkdtempSync(join(tmpdir(), 'agent-kit-work-result-'));
        env = { root, version: '0.1.0', assetsDir: join(__dirname, '..', '..', 'assets') };
        init(root, [], { host: 'github' });
    });

    afterEach((): void => {
        rmSync(root, { recursive: true, force: true });
    });

    it('SC-AK-1613 — отказы на сто вызовов считаются по дням и по проверкам', () => {
        recorded('2026-08-11', [
            ...calls('2026-08-11', 200),
            ...[1, 2, 3, 4, 5, 6].map((n: number): TEntry => refusal('2026-08-11', n * 25 + 5, 'grill-gate')),
            refusal('2026-08-11', 1005, 'task-flow'),
            refusal('2026-08-11', 1505, 'task-flow'),
        ]);
        recorded(TODAY, [...calls(TODAY, 100), refusal(TODAY, 505, '')]);

        const text: readonly string[] = metrics(env, { days: 2, json: false, today: TODAY }).lines;
        const days: readonly Record<string, unknown>[] = daysOf(metrics(env, { days: 2, json: true, today: TODAY }));

        expect(text).toContain('    2026-08-11: 4.00 (8 из 200)');
        expect(text).toContain('      grill-gate: 3.00');
        expect(text).toContain('      task-flow: 1.00');
        expect(text).toContain('    2026-08-12: 1.00 (1 из 100)');
        expect(text).toContain('      unnamed: 1.00');
        expect(days.map((day: Record<string, unknown>): unknown => day['refusalsPer100'])).toEqual([4, 1]);
    });

    it('SC-AK-1621 — вердикт «не достигнута» и «частично» идут в счёт задачи своей ветки', () => {
        recorded(TODAY, [
            ...calls(TODAY, 3),
            verdict(100, { verdict: 'refused', task: 'RT-1' }),
            verdict(200, { verdict: 'refused', task: 'RT-2' }),
            verdict(300, { verdict: 'passed', task: 'RT-3' }),
        ]);

        const text: readonly string[] = ofDay(false).lines;

        expect(text).toContain('  Цель не достигнута: 2');
        expect(text).toContain('    RT-1: 1');
        expect(text).toContain('    RT-2: 1');
        expect(text).not.toContain('    RT-3: 1');
        expect(daysOf(ofDay(true))[0]['goalNotMet']).toBe(2);
    });

    it('SC-AK-1640 — вердикт на ветке эпика идёт эпику, без эпика — под «без задачи»', () => {
        recorded(TODAY, [
            ...calls(TODAY, 3),
            verdict(100, { verdict: 'refused', epic: '7' }),
            verdict(200, { verdict: 'refused', task: 'none' }),
        ]);

        const text: readonly string[] = ofDay(false).lines;

        expect(text).toContain('    эпик 7: 1');
        expect(text).toContain('    без задачи: 1');
    });

    it('SC-AK-1627 — среди строк результата нет «нет данных», и JSON не несёт null', () => {
        recorded(TODAY, [...calls(TODAY, 5), refusal(TODAY, 15, 'grill-gate')]);

        const text: readonly string[] = ofDay(false).lines;
        const noData: string | undefined = text.find((one: string): boolean => one.startsWith('нет данных:'));
        const days: readonly Record<string, unknown>[] = daysOf(ofDay(true));

        expect(text).toContain('результат работы:');
        expect(text).toContain('  Принято с первого раза: 0 из 0');
        expect(text).toContain('  Задачи слиты: 0, с видимым взятием 0, от взятия 0.0 ч');
        expect(text).toContain('  Переспросили: 0');
        expect(text).toContain('  Правки владельца: 0');
        expect(text).toContain('  Повторы ошибок: считается в приёмнике');
        expect(noData).toContain('Экзамены с первого раза');
        expect(noData).not.toContain('Принято с первого раза');
        expect(noData).not.toContain('Правки владельца');
        expect(Object.values(days[0]).filter((value: unknown): boolean => value === null)).toEqual([]);
    });

    it('SC-AK-1628 — день без записи сессий говорит об этом одной фразой и печатает слияния', () => {
        recorded('2026-08-11', calls('2026-08-11', 2));
        recorded(TODAY, [{ t: at(TODAY, 100), ev: 'task-merged', task: 'RT-5', opens: '1', epic: 'RT-4' }]);

        const text: readonly string[] = ofDay(false).lines;

        expect(text).toContain('  Задачи слиты: 1, с видимым взятием 0, от взятия 0.0 ч');
        expect(text.filter((one: string): boolean => one.includes('записи сессий за этот день нет'))).toEqual([
            '  2026-08-12: записи сессий за этот день нет',
        ]);
        expect(text).toContain('  Повторы ошибок: считается в приёмнике');
        expect(text.join('\n')).not.toContain('Переспросили');
        expect(text.join('\n')).not.toContain('Простой');
    });

    it('SC-AK-1649 — день старше счётчика назван отдельно и не несёт чисел записи', () => {
        recorded('2026-08-10', [{ t: at('2026-08-10', 0), ev: 'guard-deny', res: 'grill-gate', sid: '1' }]);
        recorded(TODAY, calls(TODAY, 2));

        const text: readonly string[] = metrics(env, { days: 30, json: false, today: TODAY, day: '2026-08-10' }).lines;
        const day: Record<string, unknown> = daysOf(metrics(env, { days: 30, json: true, today: TODAY, day: '2026-08-10' }))[0];

        expect(text).toContain('  2026-08-10: запись дня до счётчика');
        expect(day['beforeCounter']).toBe(true);
        expect(Object.keys(day)).not.toContain('calls');
        expect(Object.keys(day)).toContain('tasksMerged');
    });

    it('SC-AK-1623 — эпик, слитый без редакции после слияния, не выпущен', () => {
        recorded('2026-11-11', [{ t: '2026-11-11T10:00:00Z', ev: 'edition', pkg: 'agent-kit', ver: '0.37.0' }]);
        recorded('2026-11-13', [
            { t: '2026-11-13T00:34:01Z', ev: 'task-merged', task: 'RT-3266', opens: '1', epic: 'RT-3227' },
            { t: '2026-11-13T05:48:08Z', ev: 'epic-merged', task: 'RT-3227', pkg: 'agent-kit' },
        ]);

        const text: readonly string[] = metrics(env, { days: 30, json: false, today: '2026-11-14', day: '2026-11-13' }).lines;

        expect(text).toContain('  RT-3227 не выпущен, слит 05:48');
        expect(text).toContain('    окно 00:34–05:48: отказов 0 из 0, переспросили 0');
    });

    it('SC-AK-1639 — эпики периода несут часы от взятия, открытый тоже', () => {
        recorded('2026-11-10', [
            { t: '2026-11-10T08:00:00Z', ev: 'task-taken', task: 'RT-10', sid: 's1' },
            { t: '2026-11-10T12:00:00Z', ev: 'task-merged', task: 'RT-11', opens: '1', epic: 'RT-10' },
        ]);
        recorded('2026-11-11', [
            { t: '2026-11-11T09:00:00Z', ev: 'task-taken', task: 'RT-20', sid: 's2' },
            { t: '2026-11-11T10:00:00Z', ev: 'task-merged', task: 'RT-21', opens: '1', epic: 'RT-20' },
            { t: '2026-11-11T17:00:00Z', ev: 'epic-merged', task: 'RT-10', pkg: 'agent-kit' },
            { t: '2026-11-11T18:00:00Z', ev: 'edition', pkg: 'agent-kit', ver: '0.38.0' },
        ]);

        const text: readonly string[] = metrics(env, { days: 30, json: false, today: '2026-11-14', day: '2026-11-11' }).lines;

        expect(text).toContain('  RT-10 выпущен 18:00, от взятия 34.0 ч');
        expect(text).toContain('  RT-20 открыт');
        expect(text).toContain('    окно 10:00–открыто: отказов 0 из 0, переспросили 0');
    });

    it('SC-AK-1626 — строка вехи G на каждый день периода', () => {
        const spread: (day: string, n: number) => TEntry[] = (day: string, n: number): TEntry[] =>
            Array.from({ length: n }, (_: unknown, i: number): TEntry => refusal(day, 1000 * (i + 1) + 5, `check-${i}`));

        recorded('2026-08-11', [...calls('2026-08-11', 100), ...spread('2026-08-11', 4)]);
        recorded(TODAY, [...calls(TODAY, 100), ...spread(TODAY, 6)]);

        const text: readonly string[] = metrics(env, { days: 2, json: false, today: TODAY }).lines;

        expect(text).toContain('  2026-08-11 веха G: отказов 4.00 на сто (порог 5), тупиков 0 — достигнута');
        expect(text).toContain('  2026-08-12 веха G: отказов 6.00 на сто (порог 5), тупиков 0 — не достигнута');
    });

    it('SC-AK-1637 — ровно пять отказов на сто вызовов вехой не считается', () => {
        recorded(TODAY, [
            ...calls(TODAY, 200),
            ...Array.from({ length: 10 }, (_: unknown, i: number): TEntry => refusal(TODAY, 150 * (i + 1) + 5, `check-${i}`)),
        ]);

        expect(ofDay(false).lines).toContain('  веха G: отказов 5.00 на сто (порог 5), тупиков 0 — не достигнута');
    });

    it('SC-AK-1638 — день без вызовов вехой не судится', () => {
        recorded('2026-08-11', calls('2026-08-11', 2));
        recorded(TODAY, [{ t: at(TODAY, 100), ev: 'task-merged', task: 'RT-5', opens: '1', epic: 'RT-4' }]);

        const text: readonly string[] = ofDay(false).lines;

        expect(text).toContain('  Задачи слиты: 1, с видимым взятием 0, от взятия 0.0 ч');
        expect(text).toContain('  веха G: вызовов нет');
    });

    it('SC-AK-1642 — отчёт дня называет пропущенные строки записи', () => {
        recorded(TODAY, [...calls(TODAY, 2), { t: at(TODAY, 30), ev: 'record-skip', n: '1', sid: 's1' }]);

        expect(ofDay(false).lines).toContain('  Пропущено строк записи: 1 (2026-08-12)');
    });
});
