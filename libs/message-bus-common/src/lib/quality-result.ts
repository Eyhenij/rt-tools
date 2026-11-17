/**
 * Раздел «Качество»: числа результата работы, веха по дням, пары подряд и окна эпиков.
 *
 * Числа считает пакет на дереве и шлёт строкой дня и окном эпика; приёмник их только складывает.
 * Значение, которого строка не несёт, не ноль: плитка называет, сколько строк периода его не несли.
 */
import { ITreeChoice } from './tree-choice';

/** Плитки результата работы. Набор закрыт: каждая читает свои ключи строки дня. */
export enum EQualityResultTile {
    TasksMerged = 'tasksMerged',
    RefusalsPer100 = 'refusalsPer100',
    Idle = 'idle',
    Reasks = 'reasks',
    Interrupts = 'interrupts',
    GoalNotMet = 'goalNotMet',
    DeadEnds = 'deadEnds',
}

/** Одна плитка: значение в единицах экрана и сколько строк периода его не несли. */
export interface IQualityResultTile {
    /** Пусто: ни одна строка периода ключа не несёт, и экран пишет «нет данных». */
    readonly value: number | null;
    readonly missing: number;
}

/** Плитки результата и подписи под ними. */
export interface IQualityResult {
    readonly tiles: Readonly<Record<EQualityResultTile, IQualityResultTile>>;
    /** Часы от взятия до слияния на задачу, десятые. Пусто: времени взятия нет ни у одной задачи. */
    readonly takenHours: number | null;
    /** Слова владельца периода для подписи «из N слов владельца». Пусто: строки их не несут. */
    readonly ownerWords: number | null;
}

/** Веха G одного дня. */
export enum EQualityMilestone {
    Reached = 'reached',
    Missed = 'missed',
    NoCalls = 'noCalls',
}

export interface IQualityMilestoneDay {
    readonly day: string;
    readonly milestone: EQualityMilestone;
}

/** Пара проверок, отказавших подряд. */
export interface IQualityPair {
    readonly first: string;
    readonly second: string;
    readonly count: number;
}

/** Состояние эпика на конец показанного периода. */
export enum EQualityEpicState {
    Released = 'released',
    NotReleased = 'notReleased',
    Open = 'open',
}

/** Окно эпика, каким его показывает блок «Окна эпиков». */
export interface IQualityEpicWindow {
    readonly tree: ITreeChoice;
    readonly origin: string;
    readonly epic: number;
    readonly from: string;
    /** Пусто: окно открыто. */
    readonly to: string | null;
    readonly calls: number;
    readonly refusals: number;
    readonly reasks: number;
    readonly state: EQualityEpicState;
    /** Часы эпика от взятия, десятые. Пусто: эпик к концу периода не слит или взятия не видно. */
    readonly hours: number | null;
}
