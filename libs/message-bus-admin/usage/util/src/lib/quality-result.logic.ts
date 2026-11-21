/**
 * Показ результата работы в разделе «Качество»: плитки, веха G по дням, пары подряд и окна эпиков.
 *
 * Считает приёмник, здесь только слова и единицы. Значение, которого строки не несут, читается
 * «Нет данных», а не нулём; сколько строк его не несли, плитка говорит подписью.
 */
import { TAdminLabelKey, TAdminText } from '@rt/message-bus-admin/common/core/util';
import {
    EQualityEpicState,
    EQualityMilestone,
    EQualityResultTile,
    IQualityEpicWindow,
    IQualityMilestoneDay,
    IQualityPair,
    IQualityResult,
    IQualityResultTile,
} from '@rt/message-bus-common';
import { IRtTag } from '@rt-tools/ui-kit-v2';

/** Плитка результата, готовая к отрисовке: тот же вид, что у трёх чисел итога. */
export interface IQualityResultTileView {
    readonly key: EQualityResultTile;
    readonly label: string;
    readonly value: string;
    readonly secondary: string | null;
    readonly hint: string;
}

/** Строка блока с меткой состояния: день вехи или окно эпика. */
export interface IQualityStateRow {
    readonly title: string;
    readonly state: string;
    readonly severity: IRtTag.Severity;
    readonly span: string | null;
    readonly note: string | null;
}

/** Строка блока «Подряд». */
export interface IQualityPairRow {
    readonly pair: string;
    readonly count: number;
}

interface ITileWords {
    readonly label: TAdminLabelKey;
    readonly hint: TAdminLabelKey;
    /** Значение в словах. По умолчанию — число как есть. */
    readonly value?: (value: number, text: TAdminText) => string;
    /** Своя подпись плитки, кроме числа строк без значения. */
    readonly note?: (result: IQualityResult, text: TAdminText) => string | null;
}

const TILE_WORDS: Readonly<Record<EQualityResultTile, ITileWords>> = Object.freeze({
    [EQualityResultTile.TasksMerged]: {
        label: 'qualityMergedTasks',
        hint: 'qualityMergedTasksHint',
        note: (result: IQualityResult, text: TAdminText): string | null =>
            result.takenHours === null ? null : text('qualityTakenHours', { value: result.takenHours.toFixed(1) }),
    },
    [EQualityResultTile.RefusalsPer100]: {
        label: 'qualityRefusalsPer100',
        hint: 'qualityRefusalsPer100Hint',
        value: (value: number): string => value.toFixed(2),
        note: (result: IQualityResult, text: TAdminText): string | null =>
            result.refusalsOfCalls === null ? null : text('qualityRefusalsOfCalls', { ...result.refusalsOfCalls }),
    },
    [EQualityResultTile.Idle]: {
        label: 'qualityIdle',
        hint: 'qualityIdleHint',
        value: (value: number, text: TAdminText): string => text('qualityHours', { value: value.toFixed(1) }),
    },
    [EQualityResultTile.Reasks]: { label: 'qualityReasks', hint: 'qualityReasksHint' },
    [EQualityResultTile.Interrupts]: {
        label: 'qualityInterrupts',
        hint: 'qualityInterruptsHint',
        note: (result: IQualityResult, text: TAdminText): string | null =>
            result.ownerWords === null ? null : text('qualityOwnerWords', { count: result.ownerWords }),
    },
    [EQualityResultTile.GoalNotMet]: { label: 'qualityGoalNotMet', hint: 'qualityGoalNotMetHint' },
    [EQualityResultTile.DeadEnds]: { label: 'qualityDeadEnds', hint: 'qualityDeadEndsHint' },
});

const MILESTONE_WORDS: Readonly<Record<EQualityMilestone, { readonly state: TAdminLabelKey; readonly severity: IRtTag.Severity }>> =
    Object.freeze({
        [EQualityMilestone.Reached]: { state: 'qualityMilestoneReached', severity: 'success' },
        [EQualityMilestone.Missed]: { state: 'qualityMilestoneMissed', severity: 'danger' },
        [EQualityMilestone.NoCalls]: { state: 'qualityMilestoneNoCalls', severity: 'neutral' },
    });

const EPIC_WORDS: Readonly<Record<EQualityEpicState, { readonly state: TAdminLabelKey; readonly severity: IRtTag.Severity }>> =
    Object.freeze({
        [EQualityEpicState.Released]: { state: 'qualityEpicReleased', severity: 'success' },
        [EQualityEpicState.NotReleased]: { state: 'qualityEpicNotReleased', severity: 'danger' },
        [EQualityEpicState.Open]: { state: 'qualityEpicOpen', severity: 'neutral' },
    });

/** День `ГГГГ-ММ-ДД` так, как его пишет отбор периода. */
function dayShown(day: string): string {
    const [year, month, date]: string[] = day.split('-');

    return `${date}.${month}.${year}`;
}

/** Момент окна по всемирному времени, как его печатает отчёт пакета: `ДД.ММ ЧЧ:ММ`. */
function momentShown(moment: string): string {
    return `${moment.slice(8, 10)}.${moment.slice(5, 7)} ${moment.slice(11, 16)}`;
}

function tileView(key: EQualityResultTile, tile: IQualityResultTile, result: IQualityResult, text: TAdminText): IQualityResultTileView {
    const words: ITileWords = TILE_WORDS[key];
    const shown: (value: number, said: TAdminText) => string = words.value ?? ((value: number): string => String(value));
    const missing: string | null = tile.missing > 0 && tile.value !== null ? text('qualityMissingLines', { count: tile.missing }) : null;
    const notes: readonly (string | null)[] = [tile.value === null ? null : (words.note?.(result, text) ?? null), missing];

    return {
        key,
        label: text(words.label),
        value: tile.value === null ? text('qualityNoData') : shown(tile.value, text),
        secondary: notes.filter(Boolean).join(' · ') || null,
        hint: text(words.hint),
    };
}

/** Плитки результата в порядке набора. */
export function qualityResultTiles(result: IQualityResult, text: TAdminText): readonly IQualityResultTileView[] {
    return Object.values(EQualityResultTile).map((key: EQualityResultTile): IQualityResultTileView =>
        tileView(key, result.tiles[key], result, text)
    );
}

/** Веха G каждого дня. День без вызовов подписи не несёт: делить там нечего. */
export function qualityMilestoneRows(days: readonly IQualityMilestoneDay[], text: TAdminText): readonly IQualityStateRow[] {
    return days.map((one: IQualityMilestoneDay): IQualityStateRow => {
        const words: { readonly state: TAdminLabelKey; readonly severity: IRtTag.Severity } = MILESTONE_WORDS[one.milestone];

        return {
            title: dayShown(one.day),
            state: text(words.state),
            severity: words.severity,
            span: null,
            note: one.per100 === null ? null : text('qualityMilestoneNote', { per100: one.per100.toFixed(2), deadEnds: one.deadEnds }),
        };
    });
}

/** Пары подряд по обеим проверкам. */
export function qualityPairRows(pairs: readonly IQualityPair[]): readonly IQualityPairRow[] {
    return pairs.map((pair: IQualityPair): IQualityPairRow => ({ pair: `${pair.first} → ${pair.second}`, count: pair.count }));
}

/** Окна эпиков: эпик, его состояние на конец периода, отрезок и числа. */
export function qualityWindowRows(windows: readonly IQualityEpicWindow[], text: TAdminText): readonly IQualityStateRow[] {
    return windows.map((one: IQualityEpicWindow): IQualityStateRow => {
        const words: { readonly state: TAdminLabelKey; readonly severity: IRtTag.Severity } = EPIC_WORDS[one.state];
        const numbers: string = text('qualityWindowNumbers', { refusals: one.refusals, calls: one.calls, reasks: one.reasks });
        const hours: string | null = one.hours === null ? null : text('qualityWindowHours', { hours: one.hours.toFixed(1) });

        return {
            title: text('qualityEpic', { epic: one.epic }),
            state: text(words.state),
            severity: words.severity,
            span:
                one.to === null
                    ? text('qualityWindowOpenSince', { from: momentShown(one.from) })
                    : `${momentShown(one.from)} — ${momentShown(one.to)}`,
            note: [numbers, hours].filter(Boolean).join(' · '),
        };
    });
}
