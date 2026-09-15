/**
 * Использование правил: то, чем отвечает приёмник на чтение таблицы скилов и сессий одного скила.
 *
 * Лежит в общей либе, потому что форму читают обе стороны: приёмник её собирает, админка по ней
 * рисует таблицу и панель. Копия у каждой из сторон разошлась бы с другой молча — обе остались
 * бы зелёными.
 */
import { IPage } from './page';

/** Сутки в миллисекундах: ими обе стороны ходят по дням периода. */
export const DAY_MS: number = 24 * 60 * 60 * 1000;

/** Строка использования одного скила за период: загрузки, сессии с загрузкой, отказы гейта правил. */
export interface IUsageRow {
    readonly skill: string;
    /** Род скила: правило, паттерн, скил пакета, свой скил дерева. */
    readonly kind: string;
    readonly loads: number;
    readonly sessions: number;
    readonly denials: number;
}

/** Одна сессия одного скила: день, признак сессии и сколько раз она его загрузила. */
export interface IUsageSessionRow {
    readonly day: string;
    readonly sid: string;
    readonly count: number;
}

/**
 * Страница таблицы скилов вместе с периодом, за который считана.
 *
 * Период едет в ответе, потому что запрос мог его не назвать: тогда его подставил приёмник, и
 * экран показывает в отборе тот период, который считан, а не пустоту.
 */
export interface IUsagePage extends IPage<IUsageRow> {
    readonly from: string;
    readonly to: string;
}

/** Один день периода: загрузки, отдельные сессии с загрузкой, отказы гейта. День без строк — нули. */
export interface IUsageDayRow {
    readonly day: string;
    readonly loads: number;
    readonly sessions: number;
    readonly denials: number;
}

/** Загрузки одного рода скила за период. */
export interface IUsageKindRow {
    readonly kind: string;
    readonly loads: number;
}

/**
 * Сводка периода: то, чем раздел рисует график и списки над таблицей.
 *
 * Своя операция, а не поля страницы: страница меняется с порядком и номером, сводка — только с
 * периодом, и внутри страницы она перечитывалась бы на каждую сортировку. Дни — все дни периода
 * подряд, с нулями: график рисует столбик на день, и дыра в днях читалась бы как день без строки.
 */
export interface IUsageDigest {
    readonly from: string;
    readonly to: string;
    readonly days: readonly IUsageDayRow[];
    readonly kinds: readonly IUsageKindRow[];
    /** Пять самых загружаемых скилов. */
    readonly top: readonly IUsageRow[];
    /** Пять скилов с наибольшим числом отказов гейта; без отказов — пусто. */
    readonly denied: readonly IUsageRow[];
}
