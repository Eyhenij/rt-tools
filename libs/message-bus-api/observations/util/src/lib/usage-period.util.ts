/**
 * Период чтения использования: два дня, оба включительно, не длиннее предела.
 *
 * Разбор чистый и отказа не бросает: код отказа знает операция. Предел — четыреста дней: строки
 * живут год, и период длиннее не считает ничего сверх того, а хранилище читает всю таблицу.
 */
import { OBSERVATION_DAY } from './observation.const';

/** Самый длинный период чтения в днях. */
export const USAGE_PERIOD_MAX_DAYS: number = 400;

const MS_PER_DAY: number = 24 * 60 * 60 * 1000;

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
    return Math.round((new Date(period.to).getTime() - new Date(period.from).getTime()) / MS_PER_DAY) + 1;
}

/** Чем период не сошёлся. Пусто — период годен. */
export function usagePeriodFault(query: Record<string, unknown>): string | null {
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

/** Период из запроса. Зовётся после проверки: негодный запрос сюда не доходит. */
export function usagePeriodOf(query: Record<string, unknown>): IUsagePeriod {
    return { from: String(query['from']), to: String(query['to']) };
}

/** Признак дерева из запроса: пусто — дерево не названо. */
export function usageTreeOf(query: Record<string, unknown>): string {
    const tree: unknown = query['tree'];

    return typeof tree === 'string' ? tree.trim() : '';
}
