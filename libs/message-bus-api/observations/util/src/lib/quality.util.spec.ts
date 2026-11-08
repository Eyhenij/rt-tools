import { describe, expect, it } from 'vitest';

import { IQualityReport, ITreeChoice } from '@rt/message-bus-common';

import {
    IQualityDayRow,
    IQualityFirstSeen,
    IQualityInput,
    IQualityRecord,
    qualityFreshFrom,
    qualityOf,
    qualityVersionOf,
} from './quality.util';

const ONE: ITreeChoice = { slug: 'one', name: 'Первое' };
const TWO: ITreeChoice = { slug: 'two', name: 'Второе' };

function line(metrics: Record<string, number>, over: Partial<IQualityDayRow> = {}): IQualityDayRow {
    return { tree: ONE, day: '2026-11-05', version: '0.35.0', metrics, ...over };
}

function report(over: Partial<IQualityInput>): IQualityReport {
    return qualityOf({
        from: '2026-10-09',
        to: '2026-11-07',
        today: '2026-11-07',
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
        ...over,
    });
}

describe('qualityOf', () => {
    it('SC-AK-1322 — откат другого дня вычитается один раз', () => {
        const apart: IQualityReport = report({
            rows: [line({ tasksAccepted: 1, tasksFirstPass: 1 }), line({ tasksLost: 1 }, { day: '2026-11-06' })],
        });
        const same: IQualityReport = report({ rows: [line({ tasksAccepted: 1, tasksFirstPass: 1, tasksLost: 1 })] });

        expect(apart.firstPass.firstPass).toBe(0);
        expect(same.firstPass.firstPass).toBe(0);
    });

    it('SC-AK-1325 — меньше десяти задач дают счёт, а не долю', () => {
        const few: IQualityReport = report({ rows: [line({ tasksAccepted: 3, tasksFirstPass: 2, ownerCorrections: 1 })] });

        expect(few.firstPass).toEqual({ counted: 3, firstPass: 2, share: null, noHandover: 0 });
        expect(few.corrections.perTask).toBeNull();
    });

    it('SC-AK-1325 — с десяти задач появляется доля, закрытые без слияния её снижают', () => {
        const many: IQualityReport = report({
            rows: [line({ tasksAccepted: 8, tasksClosed: 2, tasksFirstPass: 5, tasksNoHandover: 4, ownerCorrections: 2 })],
        });

        expect(many.firstPass).toEqual({ counted: 10, firstPass: 5, share: 50, noHandover: 4 });
    });

    it('SC-AK-1326 — полнота называет деревья и причину последнего сбоя', () => {
        const done: IQualityReport = report({
            fresh: [
                line({ sendFault: 3 }, { day: '2026-11-01' }),
                line({}, { day: '2026-11-06' }),
                line({ sendFault: 4, outcomesUnread: 1 }, { tree: TWO }),
            ],
        });

        expect(done.completeness).toEqual({ enrolled: 2, sent: 2, withOutcomes: 1, faults: [{ tree: TWO, fault: 4 }] });
    });

    it('SC-AK-1327 — таблица причин идёт по потерям, дерево и версия её сужают, а числа итога нет', () => {
        const rows: readonly IQualityDayRow[] = [
            line({ tasksAccepted: 2, 'guardEmpty:a': 1, 'wastedRuns:e2e': 2, 'wastedSeconds:e2e': 90, 'guardRefusals:a': 5 }),
            line({ tasksAccepted: 3, 'guardEmpty:b': 9 }, { tree: TWO, version: '0.34.0' }),
        ];

        expect(report({ rows }).rows.map((row: { resource: string }): string => row.resource)).toEqual(['b', 'e2e', 'a']);

        const narrow: IQualityReport = report({ rows, tree: 'one' });

        expect(narrow.rows.map((row: { resource: string }): string => row.resource)).toEqual(['e2e', 'a']);
        expect(narrow.rows[0]).toMatchObject({ wastedRuns: 2, wastedSeconds: 90, loss: 2 });
        expect(narrow.corrections.accepted).toBe(2);
        expect(report({ rows }).corrections.accepted).toBe(5);
        expect(report({ rows, tree: 'three' }).anyInPeriod).toBe(false);
        expect(report({ rows, version: '0.34.0' }).rows).toHaveLength(1);
        expect(report({ rows }).versions).toEqual(['0.34.0', '0.35.0']);
    });

    it('SC-AK-1328 — повтор считается на версии с фиксом и в месяц после её установки', () => {
        const fix: IQualityRecord = {
            id: 'fix',
            tree: 'one',
            resource: 'rules/testing.md',
            arrived: '2026-08-01',
            releaseVersion: '0.30.0',
            fixed: '2026-08-10',
        };
        const repeat: IQualityRecord = { ...fix, id: 'repeat', tree: 'two', arrived: '2026-10-20', releaseVersion: null, fixed: null };
        const early: IQualityRecord = { ...repeat, id: 'early', tree: 'one', arrived: '2026-08-05' };
        const other: IQualityRecord = { ...repeat, id: 'other', resource: 'rules/other.md' };
        const unnamed: IQualityRecord = { ...repeat, id: 'unnamed', resource: null };
        const done: IQualityReport = report({
            records: [fix, repeat, early, other, unnamed],
            firstSeen: [
                { tree: 'one', version: '0.31.0', day: '2026-09-01' },
                { tree: 'two', version: '0.30.0', day: '2026-10-10' },
                { tree: 'two', version: '0.29.0', day: '2026-07-01' },
            ],
        });

        expect(done.repeats).toEqual({ repeats: 1, fixes: 1, share: null, unnamed: 1 });
    });

    it('SC-AK-1328 — дерево в отборе считает только свои повторы, а фиксы пакета остаются в знаменателе', () => {
        const fix: IQualityRecord = {
            id: 'fix',
            tree: 'one',
            resource: 'a',
            arrived: '2026-06-01',
            releaseVersion: '0.30.0',
            fixed: '2026-06-02',
        };
        const records: readonly IQualityRecord[] = [
            fix,
            { id: 'again', tree: 'one', resource: 'a', arrived: '2026-10-20', releaseVersion: null, fixed: null },
            { id: 'quiet', tree: 'two', resource: null, arrived: '2026-10-20', releaseVersion: null, fixed: null },
        ];
        const firstSeen: readonly IQualityFirstSeen[] = [
            { tree: 'one', version: '0.30.0', day: '2026-10-10' },
            { tree: 'two', version: '0.30.0', day: '2026-10-10' },
        ];

        expect(report({ records, firstSeen, tree: 'one' }).repeats).toMatchObject({ repeats: 1, fixes: 1, unnamed: 0 });
        expect(report({ records, firstSeen, tree: 'two' }).repeats).toMatchObject({ repeats: 0, fixes: 1, unnamed: 1 });
    });

    it('SC-AK-1328 — два повтора одного фикса считаются одним фиксом, и доля не уходит за сто', () => {
        const records: readonly IQualityRecord[] = [
            { id: 'fix', tree: 'one', resource: 'a', arrived: '2026-06-01', releaseVersion: '0.30.0', fixed: '2026-06-02' },
            { id: 'first', tree: 'one', resource: 'a', arrived: '2026-10-20', releaseVersion: null, fixed: null },
            { id: 'second', tree: 'one', resource: 'a', arrived: '2026-10-21', releaseVersion: null, fixed: null },
        ];
        const firstSeen: readonly IQualityFirstSeen[] = [{ tree: 'one', version: '0.30.0', day: '2026-10-10' }];

        expect(report({ records, firstSeen }).repeats).toMatchObject({ repeats: 1, fixes: 1 });
    });

    it('SC-AK-1328 — фикс моложе месяца в долю не входит', () => {
        const fresh: IQualityRecord = {
            id: 'fix',
            tree: 'one',
            resource: 'rules/testing.md',
            arrived: '2026-10-20',
            releaseVersion: '0.34.0',
            fixed: '2026-11-01',
        };

        expect(report({ records: [fresh] }).repeats.fixes).toBe(0);
    });
});

describe('qualityOf — период без строк', () => {
    it('SC-AK-1331 — ответ говорит, что за период строк нет, хотя в другие дни они были', () => {
        expect(report({ rows: [] }).anyInPeriod).toBe(false);
        expect(report({ rows: [line({ sessions: 1 })] }).anyInPeriod).toBe(true);
    });
});

describe('qualityOf — две копии одного дерева', () => {
    it('SC-AK-1326 — сбой одной копии виден, даже если вторая в тот же день отправила без сбоя', () => {
        const clean: IQualityDayRow = line({ sessions: 1 }, { day: '2026-11-07' });
        const failed: IQualityDayRow = line({ sessions: 1, sendFault: 2 }, { day: '2026-11-07' });

        expect(report({ fresh: [clean, failed] }).completeness).toMatchObject({ sent: 1, faults: [{ tree: ONE, fault: 2 }] });
    });

    it('SC-AK-1326 — сбой прошлого дня снят более свежей строкой', () => {
        const old: IQualityDayRow = line({ sendFault: 1 }, { day: '2026-11-05' });
        const fresh: IQualityDayRow = line({ sessions: 1 }, { day: '2026-11-06' });

        expect(report({ fresh: [old, fresh] }).completeness.faults).toEqual([]);
    });
});

describe('доводы запроса', () => {
    it('окно свежести считается от сегодняшнего дня', () => {
        expect(qualityFreshFrom('2026-11-07')).toBe('2026-11-01');
    });

    it('версия читается из запроса, чужая форма читается как её отсутствие', () => {
        expect(qualityVersionOf({ version: ' 0.35.0 ' })).toBe('0.35.0');
        expect(qualityVersionOf({ version: 1 })).toBe('');
    });
});
