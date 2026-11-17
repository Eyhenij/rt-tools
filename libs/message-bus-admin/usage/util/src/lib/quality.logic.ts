/**
 * Чистая логика раздела «Качество»: столбцы таблицы причин и всё, что стоит над ней словами.
 *
 * Считает приёмник, здесь только показ: доля или счёт вместо неё, причина сбоя словом.
 * Словарь приходит доводом, чтобы подписи собирались на выбранном языке.
 */
import { IAdminColumn, TAdminLabelKey, TAdminText } from '@rt/message-bus-admin/common/core/util';
import {
    EQualityResultTile,
    EQualitySendFault,
    IPage,
    IQualityCompleteness,
    IQualityCorrections,
    IQualityDriverRow,
    IQualityFirstPass,
    IQualityRepeats,
    IQualityReport,
    IQualityTreeFault,
} from '@rt/message-bus-common';

import {
    IQualityPairRow,
    IQualityStateRow,
    qualityMilestoneRows,
    qualityPairRows,
    qualityResultTiles,
    qualityWindowRows,
} from './quality-result.logic';

/** Адрес операции раздела. */
export const QUALITY_PATH: string = '/api/usage/quality';

/** Ключ, под которым хранится выбор столбцов таблицы причин. */
export const QUALITY_TABLE_ID: string = 'admin-quality-drivers';

/** Ячейка без значения. */
const NO_VALUE: string = '—';

/** Сколько секунд в минуте таблицы причин. */
const SECONDS_IN_MINUTE: number = 60;

/** Столбцы таблицы причин. Порядок один, по потерям, поэтому заголовки не сортируют. */
export const QUALITY_COLUMNS: readonly IAdminColumn[] = Object.freeze([
    { key: 'resource', label: 'columnResource', locked: true },
    { key: 'loss', label: 'columnLoss' },
    { key: 'empty', label: 'columnEmptyRefusals' },
    { key: 'refusals', label: 'columnRefusals' },
    { key: 'gateRefusals', label: 'columnGateRefusals' },
    { key: 'afterLoad', label: 'columnAfterLoad' },
    { key: 'wastedRuns', label: 'columnWastedRuns' },
    { key: 'wastedMinutes', label: 'columnWastedMinutes' },
    { key: 'per100', label: 'columnPer100' },
]);

/** Три числа итога. */
export enum EQualityTile {
    FirstPass = 'first-pass',
    Corrections = 'corrections',
    Repeats = 'repeats',
}

/** Плитка числа итога, готовая к отрисовке. */
export interface IQualityTile {
    readonly key: EQualityTile | EQualityResultTile;
    readonly label: string;
    readonly value: string;
    readonly secondary: string | null;
    readonly hint: string;
}

/** Дерево с неудавшейся отправкой, названное словами. */
interface IQualityFaultLine {
    readonly tree: string;
    readonly text: string;
}

/** Всё, что стоит над таблицей. */
export interface IQualitySummaryView {
    /** Три числа итога, за ними плитки результата работы. */
    readonly tiles: readonly IQualityTile[];
    readonly completeness: string;
    readonly faults: readonly IQualityFaultLine[];
    readonly milestones: readonly IQualityStateRow[];
    readonly pairs: readonly IQualityPairRow[];
    readonly windows: readonly IQualityStateRow[];
}

/** Строка таблицы с временем в минутах: секунды человек не сравнивает. */
export interface IQualityDriverView extends IQualityDriverRow {
    readonly wastedMinutes: number;
    /** Отказы по записи на сто вызовов словами: без вызовов — прочерк. */
    readonly per100Shown: string;
}

const FAULT_LABELS: Readonly<Record<EQualitySendFault, TAdminLabelKey>> = Object.freeze({
    [EQualitySendFault.Network]: 'qualityFaultNetwork',
    [EQualitySendFault.TokenRefused]: 'qualityFaultTokenRefused',
    [EQualitySendFault.LineRefused]: 'qualityFaultLineRefused',
    [EQualitySendFault.Intake]: 'qualityFaultIntake',
    [EQualitySendFault.TreeAddressInKey]: 'qualityFaultTreeAddress',
});

function firstPassTile(first: IQualityFirstPass, text: TAdminText): IQualityTile {
    const outOf: string = text('qualityOutOf', { part: first.firstPass, whole: first.counted });
    const noHandover: string | null = first.noHandover > 0 ? text('qualityNoHandover', { count: first.noHandover }) : null;
    const counted: string = first.share === null ? outOf : `${first.share} %`;

    return {
        key: EQualityTile.FirstPass,
        label: text('qualityFirstPass'),
        value: counted,
        secondary: first.share === null ? noHandover : [outOf, noHandover].filter(Boolean).join(' · '),
        hint: text('qualityFirstPassHint'),
    };
}

function correctionsTile(corrections: IQualityCorrections, text: TAdminText): IQualityTile {
    const counted: string = text('qualityCorrectionsCount', { count: corrections.count, accepted: corrections.accepted });
    const perTask: string | null =
        corrections.perTask === null ? null : text('qualityPerTask', { value: (corrections.perTask / 100).toFixed(2) });
    const noTasks: boolean = corrections.accepted === 0;
    const note: string | null = noTasks && corrections.count > 0 ? counted : null;

    return {
        key: EQualityTile.Corrections,
        label: text('qualityCorrections'),
        value: noTasks ? text('qualityNoData') : (perTask ?? counted),
        secondary: perTask === null ? note : counted,
        hint: text('qualityCorrectionsHint'),
    };
}

/** Подпись под числом повторов. Без единого фикса она говорит почему: «0 из 0» читалось бы как итог. */
function repeatsNote(repeats: IQualityRepeats, outOf: string, text: TAdminText): string | null {
    const unnamed: string | null = repeats.unnamed > 0 ? text('qualityUnnamed', { count: repeats.unnamed }) : null;
    const first: string | null = repeats.fixes === 0 ? text('qualityNoFixesFrom') : outOf;

    return repeats.fixes > 0 && repeats.share === null ? unnamed : [first, unnamed].filter(Boolean).join(' · ');
}

function repeatsTile(repeats: IQualityRepeats, text: TAdminText): IQualityTile {
    const outOf: string = text('qualityOutOf', { part: repeats.repeats, whole: repeats.fixes });
    const counted: string = repeats.share === null ? outOf : `${repeats.share} %`;

    return {
        key: EQualityTile.Repeats,
        label: text('qualityRepeats'),
        value: repeats.fixes === 0 ? text('qualityNoData') : counted,
        secondary: repeatsNote(repeats, outOf, text),
        hint: text('qualityRepeatsHint'),
    };
}

function faultLine(fault: IQualityTreeFault, text: TAdminText): IQualityFaultLine {
    return { tree: fault.tree.name, text: text(FAULT_LABELS[fault.fault] ?? 'qualityFaultOther') };
}

function completenessLine(completeness: IQualityCompleteness, text: TAdminText): string {
    const { sent, enrolled, withOutcomes }: IQualityCompleteness = completeness;

    return text('qualityCompleteness', { sent, enrolled, withOutcomes });
}

/** Страница ответа несёт и то, что стоит над таблицей: узнаётся по форме. */
export function isQualityReport(page: IPage<IQualityDriverRow>): page is IQualityReport {
    return 'firstPass' in page;
}

/** Три числа, полнота и сбои отправки словами. */
export function qualitySummaryView(report: IQualityReport, text: TAdminText): IQualitySummaryView {
    return {
        tiles: [
            firstPassTile(report.firstPass, text),
            correctionsTile(report.corrections, text),
            repeatsTile(report.repeats, text),
            ...qualityResultTiles(report.result, text),
        ],
        completeness: completenessLine(report.completeness, text),
        faults: report.completeness.faults.map((fault: IQualityTreeFault): IQualityFaultLine => faultLine(fault, text)),
        milestones: qualityMilestoneRows(report.milestones, text),
        pairs: qualityPairRows(report.pairs),
        windows: qualityWindowRows(report.epicWindows, text),
    };
}

/** Строка таблицы для показа. */
export function qualityDriverView(row: IQualityDriverRow): IQualityDriverView {
    return {
        ...row,
        wastedMinutes: Math.round(row.wastedSeconds / SECONDS_IN_MINUTE),
        per100Shown: row.per100 === null ? NO_VALUE : row.per100.toFixed(2),
    };
}
