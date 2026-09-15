/**
 * Период чтения использования: два дня, оба включительно, не длиннее предела.
 *
 * Разбор чистый и отказа не бросает: код отказа знает операция. Предел — четыреста дней: строки
 * живут год, и период длиннее не считает ничего сверх того, а хранилище читает всю таблицу.
 *
 * Период, которого запрос не назвал вовсе, — последние тридцать дней по часам приёмника: часы
 * приёма у него, а не у экрана, и ответ называет тот период, который считал. Назван один день из
 * двух — отказ: полупериод не читается ни как умолчание, ни как открытый край.
 */
import { DAY_MS } from '@rt/message-bus-common';

import { dayOf } from './observation-retention.util';
import { OBSERVATION_DAY } from './observation.const';

/** Самый длинный период чтения в днях. */
export const USAGE_PERIOD_MAX_DAYS: number = 400;

/** Сколько дней в периоде, когда запрос его не назвал: сегодняшний день включительно. */
export const USAGE_PERIOD_DEFAULT_DAYS: number = 30;

export interface IUsagePeriod {
    readonly from: string;
    readonly to: string;
}

function dayParam(query: Record<string, unknown>, name: string): string | null {
    const value: unknown = query[name];

    return typeof value === 'string' && OBSERVATION_DAY.test(value) && !Number.isNaN(new Date(value).getTime()) ? value : null;
}

/** Сколько дней в периоде, оба края включительно. */
export function periodDays(period: IUsagePeriod): number {
    return Math.round((new Date(period.to).getTime() - new Date(period.from).getTime()) / DAY_MS) + 1;
}

/** Назван ли период хоть одним днём. Пустой параметр считается неназванным: так его снимает адрес. */
function periodNamed(query: Record<string, unknown>): boolean {
    return [query['from'], query['to']].some((value: unknown): boolean => value !== undefined && value !== '');
}

/** Чем период не сошёлся. Пусто — период годен или не назван вовсе, и его место займёт умолчание. */
export function usagePeriodFault(query: Record<string, unknown>): string | null {
    if (!periodNamed(query)) {
        return null;
    }
    const from: string | null = dayParam(query, 'from');
    const to: string | null = dayParam(query, 'to');

    if (!from || !to) {
        return 'период задаётся двумя днями `from` и `to` в форме ГГГГ-ММ-ДД';
    }
    if (to.localeCompare(from) < 0) {
        return 'день `to` стоит раньше дня `from`';
    }
    if (periodDays({ from, to }) > USAGE_PERIOD_MAX_DAYS) {
        return `период длиннее предела ${USAGE_PERIOD_MAX_DAYS} дн.`;
    }

    return null;
}

/** Последние тридцать дней по названному моменту, сегодняшний день включительно. */
export function defaultUsagePeriod(now: Date): IUsagePeriod {
    return { from: dayOf(new Date(now.getTime() - (USAGE_PERIOD_DEFAULT_DAYS - 1) * DAY_MS)), to: dayOf(now) };
}

/**
 * Период из запроса. Зовётся после проверки: негодный запрос сюда не доходит.
 *
 * Момент — параметр, а не часы машины: умолчание проверяется вызовом, а часы подставляет операция.
 */
export function usagePeriodOf(query: Record<string, unknown>, now: Date): IUsagePeriod {
    return periodNamed(query) ? { from: String(query['from']), to: String(query['to']) } : defaultUsagePeriod(now);
}

/** Признак дерева из запроса: пусто — дерево не названо. */
export function usageTreeOf(query: Record<string, unknown>): string {
    const tree: unknown = query['tree'];

    return typeof tree === 'string' ? tree.trim() : '';
}
