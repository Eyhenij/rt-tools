import { ERtCalendarDayState, IRtCalendar } from '../../rt-calendar.model';

/**
 * Месяц и подписи недели для показа `rt-calendar` на витрине.
 *
 * Лежит отдельно от обёрток, потому что их берут двое: матрица состояний и вводная история.
 * Скопированные в обе, они расходятся первой же правкой, и матрица с вводной начинают показывать
 * разное — а увидеть это можно только положив два кадра рядом.
 *
 * Месяц назван прямо, а не вычислен от нынешнего дня: вычисленный, он уводил бы кадр каждый
 * месяц без единой правки в дереве.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
export const CALENDAR_WEEKDAYS: readonly string[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Собирает день с заданным состоянием. */
export function calendarDay(
    dayOfMonth: number,
    state: ERtCalendarDayState,
    sublabel: string = '',
    disabled: boolean = false
): IRtCalendar.Day {
    return { key: `d-${dayOfMonth}`, dayOfMonth, sublabel, state, disabled };
}

/** Собирает месяц из тридцати дней, раздавая состояния функцией. */
export function calendarMonth(key: string, label: string, leading: number, pick: (index: number) => IRtCalendar.Day): IRtCalendar.Month {
    return {
        key,
        label,
        leadingBlanks: Array.from({ length: leading }, (_: unknown, index: number): number => index),
        days: Array.from({ length: 30 }, (_: unknown, index: number): IRtCalendar.Day => pick(index)),
    };
}

/**
 * Месяц со всеми четырьмя состояниями дня вперемешку: соседние дни различаются только рядом друг
 * с другом, и месяц из одних свободных дней о состояниях не говорит ничего.
 */
export const CALENDAR_MONTH: IRtCalendar.Month = calendarMonth('march-2026', 'Март 2026', 2, (index: number): IRtCalendar.Day => {
    const states: readonly ERtCalendarDayState[] = [
        ERtCalendarDayState.Past,
        ERtCalendarDayState.Free,
        ERtCalendarDayState.Busy,
        ERtCalendarDayState.Blocked,
    ];

    return calendarDay(index + 1, states[index % states.length]);
});
