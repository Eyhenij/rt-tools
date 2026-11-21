import { TAdminLabelKey, TAdminText } from '@rt/message-bus-admin/common/core/util';
import { EQualityEpicState, EQualityMilestone, EQualityResultTile, IQualityResult, IQualityResultTile } from '@rt/message-bus-common';
import { describe, expect, it } from 'vitest';

import {
    IQualityResultTileView,
    IQualityStateRow,
    qualityMilestoneRows,
    qualityPairRows,
    qualityResultTiles,
    qualityWindowRows,
} from './quality-result.logic';

/** Словарь спеки: ключ и доводы как есть, чтобы видеть, что спросили. */
const TEXT: TAdminText = (key: TAdminLabelKey, params?: Readonly<Record<string, unknown>>): string =>
    params ? `${key} ${Object.values(params).join('/')}` : key;

function result(tiles: Partial<Record<EQualityResultTile, IQualityResultTile>>, over: Partial<IQualityResult> = {}): IQualityResult {
    const empty: Record<string, IQualityResultTile> = {};

    for (const key of Object.values(EQualityResultTile)) {
        empty[key] = tiles[key] ?? { value: null, missing: 1 };
    }

    return {
        tiles: empty as Record<EQualityResultTile, IQualityResultTile>,
        takenHours: null,
        ownerWords: null,
        refusalsOfCalls: null,
        ...over,
    };
}

function tileOf(views: readonly IQualityResultTileView[], key: EQualityResultTile): IQualityResultTileView | undefined {
    return views.find((view: IQualityResultTileView): boolean => view.key === key);
}

describe('показ результата работы', () => {
    it('SC-MB-440 — значение, которого строки не несут, пишется «Нет данных» без подписи о строках', () => {
        const views: readonly IQualityResultTileView[] = qualityResultTiles(result({}), TEXT);

        expect(views).toHaveLength(Object.values(EQualityResultTile).length);
        expect(tileOf(views, EQualityResultTile.Reasks)).toMatchObject({ value: 'qualityNoData', secondary: null });
    });

    it('SC-MB-448 — «Задачи слиты» подписаны часами от взятия, а плитка с пропусками называет их', () => {
        const views: readonly IQualityResultTileView[] = qualityResultTiles(
            result(
                {
                    [EQualityResultTile.TasksMerged]: { value: 3, missing: 0 },
                    [EQualityResultTile.RefusalsPer100]: { value: 18.716, missing: 2 },
                    [EQualityResultTile.Idle]: { value: 2.4, missing: 0 },
                },
                { takenHours: 5, refusalsOfCalls: { refusals: 35, calls: 187 } }
            ),
            TEXT
        );

        expect(tileOf(views, EQualityResultTile.TasksMerged)).toMatchObject({ value: '3', secondary: 'qualityTakenHours 5.0' });
        expect(tileOf(views, EQualityResultTile.RefusalsPer100)).toMatchObject({
            value: '18.72',
            secondary: 'qualityRefusalsOfCalls 35/187 · qualityMissingLines 2',
        });
        expect(tileOf(views, EQualityResultTile.Idle)?.value).toBe('qualityHours 2.4');
    });

    it('SC-MB-441 — веха дня читается меткой состояния и числами дня, день без вызовов — без чисел', () => {
        const rows: readonly IQualityStateRow[] = qualityMilestoneRows(
            [
                { day: '2026-11-13', milestone: EQualityMilestone.Missed, per100: 18.72, deadEnds: 20 },
                { day: '2026-11-14', milestone: EQualityMilestone.NoCalls, per100: null, deadEnds: 0 },
            ],
            TEXT
        );

        expect(rows).toEqual([
            { title: '13.11.2026', state: 'qualityMilestoneMissed', severity: 'danger', span: null, note: 'qualityMilestoneNote 18.72/20' },
            { title: '14.11.2026', state: 'qualityMilestoneNoCalls', severity: 'neutral', span: null, note: null },
        ]);
    });

    it('пара подряд называет обе проверки', () => {
        expect(qualityPairRows([{ first: 'grill-gate', second: 'skill-gate', count: 6 }])).toEqual([
            { pair: 'grill-gate → skill-gate', count: 6 },
        ]);
    });

    it('SC-MB-442 — окно 13 ноября читается эпиком, «не выпущен», отрезком и числами', () => {
        const rows: readonly IQualityStateRow[] = qualityWindowRows(
            [
                {
                    tree: { slug: 'own', name: 'Своё' },
                    origin: 'copy-1',
                    epic: 3227,
                    from: '2026-11-13T00:34:01.000Z',
                    to: '2026-11-13T03:04:27.000Z',
                    calls: 187,
                    refusals: 35,
                    reasks: 3,
                    state: EQualityEpicState.NotReleased,
                    hours: 39.1,
                },
                {
                    tree: { slug: 'own', name: 'Своё' },
                    origin: 'copy-1',
                    epic: 3190,
                    from: '2026-11-11T14:38:55.000Z',
                    to: null,
                    calls: 6394,
                    refusals: 683,
                    reasks: 3,
                    state: EQualityEpicState.Open,
                    hours: null,
                },
            ],
            TEXT
        );

        expect(rows[0]).toEqual({
            title: 'qualityEpic 3227',
            state: 'qualityEpicNotReleased',
            severity: 'danger',
            span: '13.11 00:34 — 13.11 03:04',
            note: 'qualityWindowNumbers 35/187/3 · qualityWindowHours 39.1',
        });
        expect(rows[1]).toMatchObject({
            state: 'qualityEpicOpen',
            span: 'qualityWindowOpenSince 11.11 14:38',
            note: 'qualityWindowNumbers 683/6394/3',
        });
    });
});
