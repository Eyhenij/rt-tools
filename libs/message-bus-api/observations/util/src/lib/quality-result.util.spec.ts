import { describe, expect, it } from 'vitest';

import { EQualityEpicState, EQualityMilestone, EQualityResultTile, IQualityReport, ITreeChoice } from '@rt/message-bus-common';

import { IQualityWindowRow } from './quality-result.util';
import { IQualityDayRow, IQualityInput, qualityOf } from './quality.util';

const ONE: ITreeChoice = { slug: 'one', name: 'Первое' };
const TWO: ITreeChoice = { slug: 'two', name: 'Второе' };

function line(metrics: Record<string, number>, over: Partial<IQualityDayRow> = {}): IQualityDayRow {
    return { tree: ONE, day: '2026-11-13', version: '0.37.0', metrics, ...over };
}

function report(over: Partial<IQualityInput>): IQualityReport {
    return qualityOf({
        from: '2026-11-13',
        to: '2026-11-13',
        today: '2026-11-17',
        tree: '',
        version: '',
        page: 1,
        size: 20,
        anyLine: true,
        trees: [ONE, TWO],
        rows: [],
        fresh: [],
        records: [],
        firstSeen: [],
        windows: [],
        ...over,
    });
}

/** Окно эпика 3227 за 13 ноября, слитое и не выпущенное в тот день. */
function window(over: Partial<IQualityWindowRow> = {}): IQualityWindowRow {
    return {
        tree: ONE,
        origin: 'copy-1',
        epic: 3227,
        openedAt: new Date('2026-11-13T00:34:01Z'),
        closedAt: new Date('2026-11-13T03:04:27Z'),
        calls: 187,
        refusals: 35,
        reasks: 3,
        mergedAt: new Date('2026-11-13T05:48:08Z'),
        releasedAt: null,
        minutes: 2347,
        ...over,
    };
}

describe('qualityOf — результат работы', () => {
    it('SC-MB-439 — отказы на сто вызовов складываются по периоду, а не усредняются по дням', () => {
        const rows: readonly IQualityDayRow[] = [
            line({ calls: 100, refusalsHook: 6, refusalsPermission: 3, refusalsStop: 1 }, { day: '2026-11-12' }),
            line({ calls: 900, refusalsHook: 30 }),
        ];

        expect(report({ rows, from: '2026-11-12' }).result.tiles[EQualityResultTile.RefusalsPer100]).toEqual({ value: 4, missing: 0 });
        expect(report({ rows, from: '2026-11-12' }).result.refusalsOfCalls).toEqual({ refusals: 40, calls: 1000 });
    });

    it('SC-MB-448 — слитые задачи складываются, «от взятия» — минуты на задачу со временем в часах', () => {
        const rows: readonly IQualityDayRow[] = [
            line({ tasksMerged: 2, tasksTimed: 1, takenMinutes: 390 }),
            line({ tasksMerged: 1, tasksTimed: 1, takenMinutes: 210 }, { tree: TWO }),
        ];
        const shown: IQualityReport = report({ rows });

        expect(shown.result.tiles[EQualityResultTile.TasksMerged]).toEqual({ value: 3, missing: 0 });
        expect(shown.result.takenHours).toBe(5);
    });

    it('SC-MB-449 — без принятых задач «Принято с первого раза» считает 0 из 0, а не «нет данных»', () => {
        const shown: IQualityReport = report({ rows: [line({ calls: 10, tasksMerged: 0 })] });

        expect(shown.anyInPeriod).toBe(true);
        expect(shown.firstPass).toMatchObject({ counted: 0, firstPass: 0, share: null });
    });

    it('SC-MB-440 — значение, которого строки не несут, не ноль: плитка пустая, три прежних числа как были', () => {
        const rows: readonly IQualityDayRow[] = [line({ tasksAccepted: 2, tasksFirstPass: 1 }), line({ sessions: 3 })];
        const shown: IQualityReport = report({ rows });

        for (const tile of Object.values(EQualityResultTile)) {
            expect(shown.result.tiles[tile]).toEqual({ value: null, missing: 2 });
        }
        expect(shown.result.takenHours).toBeNull();
        expect(shown.result.ownerWords).toBeNull();
        expect(shown.result.refusalsOfCalls).toBeNull();
        expect(shown.firstPass).toMatchObject({ counted: 2, firstPass: 1 });
        expect(shown.milestones).toEqual([]);
    });

    it('SC-MB-440 — плитка складывает строки с ключом и называет, сколько его не несли', () => {
        const shown: IQualityReport = report({ rows: [line({ idleMinutes: 90, ownerWords: 40, interrupts: 2 }), line({ sessions: 1 })] });

        expect(shown.result.tiles[EQualityResultTile.Idle]).toEqual({ value: 1.5, missing: 1 });
        expect(shown.result.tiles[EQualityResultTile.Interrupts]).toEqual({ value: 2, missing: 1 });
        expect(shown.result.ownerWords).toBe(40);
    });

    it('SC-MB-441 — веха G читается по дням: без тупиков и меньше пяти — достигнута, с тупиком — нет', () => {
        const rows: readonly IQualityDayRow[] = [
            line({ calls: 100, refusalsHook: 4, deadEnds: 0 }, { day: '2026-11-12' }),
            line({ calls: 100, refusalsHook: 1, deadEnds: 1 }),
        ];

        expect(report({ rows, from: '2026-11-12' }).milestones).toEqual([
            { day: '2026-11-12', milestone: EQualityMilestone.Reached, per100: 4, deadEnds: 0 },
            { day: '2026-11-13', milestone: EQualityMilestone.Missed, per100: 1, deadEnds: 1 },
        ]);
    });

    it('SC-MB-450 — день со слияниями и без вызовов читает «вызовов нет»', () => {
        expect(report({ rows: [line({ tasksMerged: 1 })] }).milestones).toEqual([
            { day: '2026-11-13', milestone: EQualityMilestone.NoCalls, per100: null, deadEnds: 0 },
        ]);
    });

    it('SC-MB-451 — таблица причин держит потери на наблюдениях, а отказы записи даёт долей на сто вызовов', () => {
        const rows: readonly IQualityDayRow[] = [
            line({ calls: 300, 'recordRefusals:grill-gate': 6, 'guardRefusals:grill-gate': 4, 'refusalPairs:grill-gate:skill-gate': 2 }),
        ];
        const shown: IQualityReport = report({ rows });

        expect(shown.rows[0]).toMatchObject({ resource: 'grill-gate', refusals: 4, recordRefusals: 6, per100: 2 });
        expect(shown.pairs).toEqual([{ first: 'grill-gate', second: 'skill-gate', count: 2 }]);
    });
});

describe('qualityOf — окна эпиков', () => {
    it('SC-MB-444 — дерево сужает окна, версия сужает числа и оставляет окна целыми', () => {
        const windows: readonly IQualityWindowRow[] = [window(), window({ tree: TWO, epic: 3190 })];
        const rows: readonly IQualityDayRow[] = [line({ tasksMerged: 1 }), line({ tasksMerged: 2 }, { version: '0.36.0' })];

        expect(report({ windows, rows, tree: 'two' }).epicWindows.map((one: { epic: number }): number => one.epic)).toEqual([3190]);

        const byVersion: IQualityReport = report({ windows, rows, version: '0.36.0' });

        expect(byVersion.epicWindows).toHaveLength(2);
        expect(byVersion.result.tiles[EQualityResultTile.TasksMerged].value).toBe(2);
    });

    it('SC-MB-452 — окно прошлого дня остаётся «не выпущен» после выпуска более позднего дня', () => {
        const windows: readonly IQualityWindowRow[] = [window({ releasedAt: new Date('2026-11-15T10:00:00Z') })];

        expect(report({ windows }).epicWindows[0]).toMatchObject({
            epic: 3227,
            state: EQualityEpicState.NotReleased,
            refusals: 35,
            calls: 187,
            reasks: 3,
            hours: 39.1,
        });
        expect(report({ windows, to: '2026-11-15' }).epicWindows[0]?.state).toBe(EQualityEpicState.Released);
    });

    it('окно вне периода не показано, открытое тянется до сейчас, поздние идут первыми', () => {
        const windows: readonly IQualityWindowRow[] = [
            window({ openedAt: new Date('2026-11-10T00:00:00Z'), closedAt: new Date('2026-11-11T00:00:00Z') }),
            window({ epic: 3190, openedAt: new Date('2026-11-11T14:38:55Z'), closedAt: null, mergedAt: null, minutes: null }),
            window(),
        ];

        expect(
            report({ windows }).epicWindows.map((one: { epic: number; state: EQualityEpicState }): string => `${one.epic} ${one.state}`)
        ).toEqual(['3227 notReleased', '3190 open']);
    });
});
