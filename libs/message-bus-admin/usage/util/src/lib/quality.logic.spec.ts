import { TAdminLabelKey, TAdminText } from '@rt/message-bus-admin/common/core/util';
import { EQualitySendFault, IPage, IQualityDriverRow, IQualityReport } from '@rt/message-bus-common';
import { describe, expect, it } from 'vitest';

import { EQualityTile, IQualitySummaryView, IQualityTile, isQualityReport, qualityDriverView, qualitySummaryView } from './quality.logic';

/** Словарь спеки: ключ и доводы как есть, чтобы видеть, что спросили. */
const TEXT: TAdminText = (key: TAdminLabelKey, params?: Readonly<Record<string, unknown>>): string =>
    params ? `${key} ${Object.values(params).join('/')}` : key;

const ROW: IQualityDriverRow = {
    resource: 'one-guard',
    refusals: 1,
    empty: 2,
    gateRefusals: 0,
    afterLoad: 0,
    wastedRuns: 1,
    wastedSeconds: 90,
    loss: 3,
};

function report(over: Partial<IQualityReport> = {}): IQualityReport {
    return {
        rows: [],
        total: 0,
        page: 1,
        size: 20,
        from: '2026-10-09',
        to: '2026-11-07',
        anyLine: true,
        anyInPeriod: true,
        firstPass: { counted: 3, firstPass: 2, share: null, noHandover: 0 },
        corrections: { count: 1, accepted: 3, perTask: null },
        repeats: { repeats: 0, fixes: 2, share: null, unnamed: 0 },
        completeness: { enrolled: 3, sent: 2, withOutcomes: 1, faults: [] },
        versions: [],
        ...over,
    };
}

function tile(view: IQualitySummaryView, key: EQualityTile): IQualityTile {
    return view.tiles.find((one: IQualityTile): boolean => one.key === key) as IQualityTile;
}

describe('qualitySummaryView', () => {
    it('SC-AK-1325 — строка без задач даёт «нет данных», а не нули', () => {
        const view: IQualitySummaryView = qualitySummaryView(
            report({
                firstPass: { counted: 0, firstPass: 0, share: null, noHandover: 0 },
                corrections: { count: 0, accepted: 0, perTask: null },
            }),
            TEXT
        );

        expect(tile(view, EQualityTile.FirstPass)).toMatchObject({ value: 'qualityNoData', secondary: null });
        expect(tile(view, EQualityTile.Corrections)).toMatchObject({ value: 'qualityNoData', secondary: null });
    });

    it('SC-AK-1325 — правки без принятых задач остаются видны подписью', () => {
        const view: IQualitySummaryView = qualitySummaryView(report({ corrections: { count: 2, accepted: 0, perTask: null } }), TEXT);

        expect(tile(view, EQualityTile.Corrections)).toMatchObject({ value: 'qualityNoData', secondary: 'qualityCorrectionsCount 2/0' });
    });

    it('SC-AK-1328 — без единого фикса плитка говорит «нет данных», а не нули', () => {
        const view: IQualitySummaryView = qualitySummaryView(report({ repeats: { repeats: 0, fixes: 0, share: null, unnamed: 2 } }), TEXT);

        expect(tile(view, EQualityTile.Repeats)).toMatchObject({
            value: 'qualityNoData',
            secondary: 'qualityNoFixesFrom · qualityUnnamed 2',
        });
    });

    it('SC-AK-1325 — меньше десяти задач дают счёт вместо доли', () => {
        const view: IQualitySummaryView = qualitySummaryView(report(), TEXT);

        expect(tile(view, EQualityTile.FirstPass).value).toBe('qualityOutOf 2/3');
        expect(tile(view, EQualityTile.Corrections).value).toBe('qualityCorrectionsCount 1/3');
        expect(tile(view, EQualityTile.Repeats).value).toBe('qualityOutOf 0/2');
    });

    it('SC-AK-1325 — от десяти задач стоит доля, а счёт уходит второй строкой', () => {
        const view: IQualitySummaryView = qualitySummaryView(
            report({
                firstPass: { counted: 10, firstPass: 7, share: 70, noHandover: 2 },
                corrections: { count: 5, accepted: 10, perTask: 50 },
                repeats: { repeats: 1, fixes: 10, share: 10, unnamed: 3 },
            }),
            TEXT
        );

        expect(tile(view, EQualityTile.FirstPass)).toMatchObject({ value: '70 %', secondary: 'qualityOutOf 7/10 · qualityNoHandover 2' });
        expect(tile(view, EQualityTile.Corrections)).toMatchObject({
            value: 'qualityPerTask 0.50',
            secondary: 'qualityCorrectionsCount 5/10',
        });
        expect(tile(view, EQualityTile.Repeats)).toMatchObject({ value: '10 %', secondary: 'qualityOutOf 1/10 · qualityUnnamed 3' });
    });

    it('SC-AK-1326 — полнота называет три числа, а сбой называет дерево и причину', () => {
        const view: IQualitySummaryView = qualitySummaryView(
            report({
                completeness: {
                    enrolled: 3,
                    sent: 2,
                    withOutcomes: 1,
                    faults: [{ tree: { slug: 'one', name: 'Первое' }, fault: EQualitySendFault.TokenRefused }],
                },
            }),
            TEXT
        );

        expect(view.completeness).toBe('qualityCompleteness 2/3/1');
        expect(view.faults).toEqual([{ tree: 'Первое', text: 'qualityFaultTokenRefused' }]);
    });

    it('SC-AK-1326 — код сбоя, которого набор не знает, всё равно называется сбоем', () => {
        const unknown: EQualitySendFault = 99 as EQualitySendFault;
        const view: IQualitySummaryView = qualitySummaryView(
            report({
                completeness: {
                    enrolled: 1,
                    sent: 1,
                    withOutcomes: 1,
                    faults: [{ tree: { slug: 'one', name: 'Первое' }, fault: unknown }],
                },
            }),
            TEXT
        );

        expect(view.faults).toEqual([{ tree: 'Первое', text: 'qualityFaultOther' }]);
    });
});

describe('qualityDriverView', () => {
    it('SC-AK-1327 — секунды впустую показываются минутами', () => {
        expect(qualityDriverView(ROW).wastedMinutes).toBe(2);
    });
});

describe('isQualityReport', () => {
    it('узнаёт ответ раздела и не принимает голую страницу', () => {
        const bare: IPage<IQualityDriverRow> = { rows: [], total: 0, page: 1, size: 20 };

        expect(isQualityReport(report())).toBe(true);
        expect(isQualityReport(bare)).toBe(false);
    });
});
