/**
 * Использование правил: то, чем отвечает приёмник на чтение таблицы скилов и сессий одного скила.
 *
 * Лежит в общей либе, потому что форму читают обе стороны: приёмник её собирает, админка по ней
 * рисует таблицу и панель. Копия у каждой из сторон разошлась бы с другой молча — обе остались
 * бы зелёными.
 */
import { IPage } from './page';

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
