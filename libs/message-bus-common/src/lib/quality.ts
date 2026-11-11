/**
 * Раздел «Качество»: что операция чтения отдаёт админке.
 *
 * Числа считает пакет на дереве, приёмник их только складывает по дням и деревьям.
 */
import { IPage } from './page';
import { ITreeChoice } from './tree-choice';

/** Поля порядка таблицы причин: она сортируется только по потерям. */
export const QUALITY_SORTABLE: readonly string[] = Object.freeze(['loss']);

/** С какого счёта показывается доля: доля из трёх задач вводит в заблуждение. */
export const QUALITY_SHARE_FROM: number = 10;

/** За сколько дней дерево считается приславшим строку. */
export const QUALITY_FRESH_DAYS: number = 7;

/** Почему не удалась последняя отправка: код из строки дня, текста в ней нет. */
export enum EQualitySendFault {
    Network = 1,
    TokenRefused = 2,
    LineRefused = 3,
    Intake = 4,
    TreeAddressInKey = 5,
}

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
    /** Сколько из этих фиксов не удержали ошибку. */
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
    readonly fault: EQualitySendFault;
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

/** Страница таблицы причин со всем, что стоит над ней. */
export interface IQualityReport extends IPage<IQualityDriverRow> {
    readonly from: string;
    readonly to: string;
    /** Приходила ли хоть одна строка дня: иначе экран объясняет, как подключить дерево. */
    readonly anyLine: boolean;
    /** Есть ли строки за спрошенный период: иначе нули читались бы как итог. */
    readonly anyInPeriod: boolean;
    readonly firstPass: IQualityFirstPass;
    readonly corrections: IQualityCorrections;
    readonly repeats: IQualityRepeats;
    readonly completeness: IQualityCompleteness;
    /** Из каких версий выбирать в отборе. */
    readonly versions: readonly string[];
}
