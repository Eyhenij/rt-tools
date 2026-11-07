/**
 * Раздел «Качество»: что операция чтения отдаёт админке.
 *
 * Числа считает пакет на дереве, приёмник их только складывает по дням и деревьям.
 */
import { ITreeChoice } from './tree-choice';

/** С какого счёта показывается доля: доля из трёх задач вводит в заблуждение. */
export const QUALITY_SHARE_FROM: number = 10;

/** За сколько дней дерево считается приславшим строку. */
export const QUALITY_FRESH_DAYS: number = 7;

/** Главное число: доля принятых с первого раза. */
export interface IQualityFirstPass {
    /** Принятые задачи и закрытые без слияния: знаменатель доли. */
    readonly counted: number;
    readonly firstPass: number;
    /** Проценты. Пусто: задач меньше порога, и показывается счёт. */
    readonly share: number | null;
    /** PR без подписи передачи: в главное число они не входят. */
    readonly noHandover: number;
}

/** Правки владельца на принятую задачу. */
export interface IQualityCorrections {
    readonly count: number;
    readonly accepted: number;
    /** Сотые доли правки на задачу. Пусто: задач меньше порога. */
    readonly perTask: number | null;
}

/** Повторные ошибки по фиксам старше месяца. */
export interface IQualityRepeats {
    readonly repeats: number;
    readonly fixes: number;
    /** Проценты. Пусто: фиксов меньше порога. */
    readonly share: number | null;
    /** Разборы периода без ресурса: их не с чем сопоставить. */
    readonly unnamed: number;
}

/** Дерево, чья последняя отправка не удалась. */
export interface IQualityTreeFault {
    readonly tree: ITreeChoice;
    /** Код причины из строки дня: текста в ней нет. */
    readonly fault: number;
}

/** Насколько можно верить числам. */
export interface IQualityCompleteness {
    readonly enrolled: number;
    /** Сколько деревьев прислали строку за последние дни. */
    readonly sent: number;
    /** Сколько из них отдают итоги задач. */
    readonly withOutcomes: number;
    readonly faults: readonly IQualityTreeFault[];
}

/** Строка таблицы причин: один ресурс пакета. */
export interface IQualityDriverRow {
    readonly resource: string;
    readonly refusals: number;
    readonly empty: number;
    readonly gateRefusals: number;
    readonly afterLoad: number;
    readonly wastedRuns: number;
    readonly wastedSeconds: number;
    /** Сумма пустых событий: пустые отказы, отказы проверки правил, отказы после загрузки, пустые запуски. */
    readonly loss: number;
}

export interface IQualityReport {
    readonly from: string;
    readonly to: string;
    /** Приходила ли хоть одна строка дня: иначе экран объясняет, как подключить дерево. */
    readonly anyLine: boolean;
    readonly firstPass: IQualityFirstPass;
    readonly corrections: IQualityCorrections;
    readonly repeats: IQualityRepeats;
    readonly completeness: IQualityCompleteness;
    readonly drivers: readonly IQualityDriverRow[];
    /** Из чего выбирать сужение таблицы. */
    readonly trees: readonly ITreeChoice[];
    readonly versions: readonly string[];
}
