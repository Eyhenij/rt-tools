/**
 * Дни сводки периода: каждый день от первого до последнего, с нулями там, где строк не было.
 *
 * Хранилище отдаёт только дни со строками; график рисует столбик на день, и дыра между днями
 * читалась бы как день без столбика, а не как день без загрузок. Заполнение чистое: период и
 * строки — доводы, часы машины не читаются.
 */
import { IUsageDayRow } from '@rt/message-bus-common';

import { dayOf } from './observation-retention.util';
import { IUsagePeriod, periodDays } from './usage-period.util';

const MS_PER_DAY: number = 24 * 60 * 60 * 1000;

/** День без строк. */
function emptyDay(day: string): IUsageDayRow {
    return { day, loads: 0, sessions: 0, denials: 0 };
}

/** Строка на каждый день периода: пришедшая из хранилища или нулевая. Порядок — по дням. */
export function usageDaysOf(period: IUsagePeriod, rows: readonly IUsageDayRow[]): readonly IUsageDayRow[] {
    const byDay: Map<string, IUsageDayRow> = new Map(rows.map((row: IUsageDayRow): [string, IUsageDayRow] => [row.day, row]));
    const start: number = new Date(period.from).getTime();
    const days: IUsageDayRow[] = [];

    for (let index: number = 0; index < periodDays(period); index += 1) {
        const day: string = dayOf(new Date(start + index * MS_PER_DAY));

        days.push(byDay.get(day) ?? emptyDay(day));
    }

    return days;
}
