/**
 * Чистая логика сводки периода: столбики графика, строки списков со шкалой, быстрый период.
 *
 * Компоненты ничего не считают: столбик приходит с высотой, строка списка — с долей, период — парой
 * дней. Момент «сегодня» — довод, не часы машины: правило проверяется вызовом.
 */
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { DAY_MS } from '@rt/message-bus-common';
import { IRtBarList } from '@rt-tools/ui-kit-v2';

import { skillKindLabel } from './usage.columns';
import { IUsage } from './usage.model';

/** Столбик графика: день, числа и высота в долях от самого высокого дня. */
export interface IUsageChartBar {
    readonly day: string;
    /** Подпись под столбиком: `ДД.ММ`. */
    readonly label: string;
    readonly loads: number;
    readonly sessions: number;
    readonly denials: number;
    /** Высота, 0…100; день без загрузок — ноль. */
    readonly heightPercent: number;
    /** Подсказка столбика: день и три числа словами словаря. */
    readonly hint: string;
}

/** Быстрый период в днях, сегодняшний день включительно. */
export type TQuickPeriodDays = 7 | 30 | 90;

/** Набор быстрых периодов в порядке показа. */
export const QUICK_PERIOD_DAYS: readonly TQuickPeriodDays[] = Object.freeze([7, 30, 90]);

/** День вида `ГГГГ-ММ-ДД` по всемирному времени. */
function dayOf(moment: Date): string {
    return moment.toISOString().slice(0, 10);
}

/** Подпись дня под столбиком: число и месяц. */
export function chartDayLabel(day: string): string {
    return `${day.slice(8, 10)}.${day.slice(5, 7)}`;
}

/** Столбики графика по дням: высота — от самого высокого дня, чтобы график занимал всю высоту. */
export function usageChartBars(days: readonly IUsage.Day.State[]): readonly IUsageChartBar[] {
    const max: number = Math.max(1, ...days.map((row: IUsage.Day.State): number => row.loads));

    return days.map((row: IUsage.Day.State): IUsageChartBar => ({
        day: row.day,
        label: chartDayLabel(row.day),
        loads: row.loads,
        sessions: row.sessions,
        denials: row.denials,
        heightPercent: Math.round((row.loads / max) * 100),
        hint: `${chartDayLabel(row.day)}: ${adminLabel('columnLoads')} ${row.loads} · ${adminLabel('columnUsageSessions')} ${row.sessions} · ${adminLabel('columnDenials')} ${row.denials}`,
    }));
}

/**
 * Строки списка со шкалой: доля считается от лидера, а не от суммы — так видно соотношение между
 * строками, а вклад каждой в общий счёт здесь не нужен.
 */
function barRows(entries: readonly { id: string; title: string; meta?: string; count: number }[]): readonly IRtBarList.Row[] {
    const max: number = Math.max(1, ...entries.map((entry: { count: number }): number => entry.count));

    return entries.map((entry: { id: string; title: string; meta?: string; count: number }): IRtBarList.Row => ({
        id: entry.id,
        title: entry.title,
        meta: entry.meta,
        value: String(entry.count),
        sharePercent: Math.round((entry.count / max) * 100),
    }));
}

/** Самые загружаемые скилы: название, род подписью, число загрузок. */
export function topSkillRows(rows: readonly IUsage.Row.State[]): readonly IRtBarList.Row[] {
    return barRows(
        rows.map((row: IUsage.Row.State) => ({ id: row.skill, title: row.skill, meta: skillKindLabel(row.kind), count: row.loads }))
    );
}

/** Скилы с отказами гейта: название и число отказов. */
export function deniedSkillRows(rows: readonly IUsage.Row.State[]): readonly IRtBarList.Row[] {
    return barRows(rows.map((row: IUsage.Row.State) => ({ id: row.skill, title: row.skill, count: row.denials })));
}

/** Загрузки по роду: род словом словаря. */
export function kindRows(rows: readonly IUsage.Kind.State[]): readonly IRtBarList.Row[] {
    return barRows(rows.map((row: IUsage.Kind.State) => ({ id: row.kind, title: skillKindLabel(row.kind), count: row.loads })));
}

/** Пара дней быстрого периода: последние `days` дней, сегодняшний включительно. */
export function quickPeriod(days: TQuickPeriodDays, now: Date): { from: string; to: string } {
    return { from: dayOf(new Date(now.getTime() - (days - 1) * DAY_MS)), to: dayOf(now) };
}

/** Какой быстрый период стоит в адресе; никакой — `undefined`, и переключатель не подсвечен. */
export function quickPeriodOf(period: { from: string; to: string }, now: Date): TQuickPeriodDays | undefined {
    return QUICK_PERIOD_DAYS.find((days: TQuickPeriodDays): boolean => {
        const quick: { from: string; to: string } = quickPeriod(days, now);

        return quick.from === period.from && quick.to === period.to;
    });
}
