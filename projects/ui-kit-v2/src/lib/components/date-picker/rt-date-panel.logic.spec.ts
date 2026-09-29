import { ERtCalendarDayState, IRtCalendar } from '../calendar/rt-calendar.model';
import {
    rtDateCanPage,
    rtDateFirstDay,
    rtDateGridKey,
    rtDateInBounds,
    rtDateMonth,
    rtDateMonths,
    rtDateNow,
    rtDateRead,
    rtDateSplit,
    rtDateTimeColumns,
    rtDateWeekdays,
    rtDateWrite,
} from './rt-date-panel.logic';
import { IRtDatePicker } from './rt-date-picker.model';

const RU: IRtDatePicker.MonthContext = { locale: 'ru', today: '2026-09-29', chosen: '2026-09-15', min: null, max: null };

function labels(cells: readonly IRtDatePicker.TimeCell[]): string[] {
    return cells.map((cell: IRtDatePicker.TimeCell): string => cell.label);
}

function offs(cells: readonly { disabled: boolean }[]): boolean[] {
    return cells.map((cell: { disabled: boolean }): boolean => cell.disabled);
}

describe('rt-date-panel.logic', () => {
    it('SC-UKV-418 — the value keeps the shape of the browser input for every type', () => {
        expect(rtDateWrite('date', '2026-09-29', '10:05')).toBe('2026-09-29');
        expect(rtDateWrite('time', '2026-09-29', '10:05')).toBe('10:05');
        expect(rtDateWrite('datetime-local', '2026-09-29', '10:05')).toBe('2026-09-29T10:05');
        expect(rtDateWrite('datetime-local', '2026-09-29', null)).toBe('');
        expect(rtDateWrite('date', null, null)).toBe('');
        expect(rtDateSplit('2026-09-29T10:05', 'datetime-local')).toEqual({ day: '2026-09-29', time: '10:05' });
        expect(rtDateSplit('10:05', 'time')).toEqual({ day: null, time: '10:05' });
        expect(rtDateSplit('', 'date')).toEqual({ day: null, time: null });
    });

    it('SC-UKV-419 — text becomes a value only when it reads as one', () => {
        expect(rtDateRead(' 2026-09-29 ', 'date')).toBe('2026-09-29');
        expect(rtDateRead('2026-02-30', 'date')).toBeNull();
        expect(rtDateRead('29.09.2026', 'date')).toBeNull();
        expect(rtDateRead('23:59', 'time')).toBe('23:59');
        expect(rtDateRead('24:00', 'time')).toBeNull();
        expect(rtDateRead('2026-09-29T10:05', 'datetime-local')).toBe('2026-09-29T10:05');
        expect(rtDateRead('2026-09-29', 'datetime-local')).toBeNull();
        expect(rtDateInBounds('2026-12-01', '2026-01-01', '2026-11-30')).toBe(false);
        expect(rtDateInBounds('2026-11-30', '2026-01-01', '2026-11-30')).toBe(true);
    });

    it('SC-UKV-424 — the minutes column follows the step, and «now» rounds down to it', () => {
        const columns: IRtDatePicker.TimeColumns = rtDateTimeColumns({ step: 15, hour: null, day: null, min: null, max: null });
        expect(columns.hours.length).toBe(24);
        expect(labels(columns.minutes)).toEqual(['00', '15', '30', '45']);
        expect(rtDateNow(new Date(2026, 8, 29, 10, 37), 15)).toEqual({ day: '2026-09-29', time: '10:30' });
        expect(rtDateNow(new Date(2026, 8, 29, 9, 4), 5)).toEqual({ day: '2026-09-29', time: '09:00' });
    });

    it('SC-UKV-426 — the bounds switch off days and months and stop the paging', () => {
        const month: IRtCalendar.Month = rtDateMonth('2026-09', { ...RU, min: '2026-09-10', max: '2026-09-29T14:30' });
        const off: number[] = month.days
            .filter((day: IRtCalendar.Day): boolean => day.disabled)
            .map((day: IRtCalendar.Day): number => day.dayOfMonth);
        expect(off).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 30]);
        expect(rtDateCanPage('2026-09', -1, '2026-09-10', null)).toBe(false);
        expect(rtDateCanPage('2026-09', 1, '2026-09-10', null)).toBe(true);
        expect(rtDateCanPage('2026-09', 1, null, '2026-09-29T14:30')).toBe(false);
        expect(offs(rtDateMonths(2026, 'ru', '2026-03-05', null)).slice(0, 3)).toEqual([true, true, false]);
    });

    it('SC-UKV-426 — the bounds switch off times, on the day of a date-with-time bound only', () => {
        const edge: IRtDatePicker.TimeColumns = rtDateTimeColumns({
            step: 15,
            hour: 14,
            day: '2026-09-29',
            min: null,
            max: '2026-09-29T14:30',
        });
        expect(edge.hours[14].disabled).toBe(false);
        expect(edge.hours[15].disabled).toBe(true);
        expect(offs(edge.minutes)).toEqual([false, false, false, true]);

        const before: IRtDatePicker.TimeColumns = rtDateTimeColumns({
            step: 15,
            hour: 23,
            day: '2026-09-28',
            min: null,
            max: '2026-09-29T14:30',
        });
        expect(offs(before.hours)).not.toContain(true);
        expect(offs(before.minutes)).not.toContain(true);

        const time: IRtDatePicker.TimeColumns = rtDateTimeColumns({ step: 30, hour: 9, day: null, min: '09:30', max: '18:00' });
        expect(time.hours[8].disabled).toBe(true);
        expect(time.hours[9].disabled).toBe(false);
        expect(offs(time.minutes)).toEqual([true, false]);
    });

    it('SC-UKV-427 — the keys move the day like a grid and stop at the bounds', () => {
        // 2026-09-29 — вторник.
        expect(rtDateGridKey('ArrowRight', '2026-09-29', 1, null, null)).toBe('2026-09-30');
        expect(rtDateGridKey('ArrowLeft', '2026-09-01', 1, null, null)).toBe('2026-08-31');
        expect(rtDateGridKey('ArrowDown', '2026-09-29', 1, null, null)).toBe('2026-10-06');
        expect(rtDateGridKey('ArrowUp', '2026-09-29', 1, null, null)).toBe('2026-09-22');
        expect(rtDateGridKey('PageDown', '2026-01-31', 1, null, null)).toBe('2026-02-28');
        expect(rtDateGridKey('PageUp', '2026-03-31', 1, null, null)).toBe('2026-02-28');
        expect(rtDateGridKey('Home', '2026-09-29', 1, null, null)).toBe('2026-09-28');
        expect(rtDateGridKey('End', '2026-09-29', 1, null, null)).toBe('2026-10-04');
        expect(rtDateGridKey('Home', '2026-09-29', 7, null, null)).toBe('2026-09-27');
        expect(rtDateGridKey('Enter', '2026-09-29', 1, null, null)).toBeNull();
        expect(rtDateGridKey('ArrowDown', '2026-09-29', 1, null, '2026-10-01')).toBe('2026-10-01');
        expect(rtDateGridKey('PageUp', '2026-09-29', 1, '2026-09-10', null)).toBe('2026-09-10');
    });

    it('SC-UKV-429 — month and weekday names follow the locale, and so does the first day of the week', () => {
        const month: IRtCalendar.Month = rtDateMonth('2026-09', RU);
        expect(month.label).toBe('Сентябрь 2026');
        // 1 сентября 2026 — вторник: при неделе с понедельника перед ним одна пустая ячейка.
        expect(month.leadingBlanks.length).toBe(1);
        expect(month.days.length).toBe(30);
        expect(rtDateFirstDay('ru')).toBe(1);
        expect(rtDateWeekdays('ru')[0]).toBe('пн');
        expect(rtDateFirstDay('en-US')).toBe(7);
        expect(rtDateWeekdays('en-US')[0]).toBe('Sun');
        expect(rtDateMonth('2026-09', { ...RU, locale: 'en-US' }).leadingBlanks.length).toBe(2);
    });

    it('SC-UKV-422 — the month marks today and the chosen day', () => {
        const days: readonly IRtCalendar.Day[] = rtDateMonth('2026-09', RU).days;
        const today: string[] = days
            .filter((day: IRtCalendar.Day): boolean => day.today === true)
            .map((day: IRtCalendar.Day): string => day.key);
        expect(today).toEqual(['2026-09-29']);
        expect(days[14].state).toBe(ERtCalendarDayState.Chosen);
        expect(days[13].state).toBe(ERtCalendarDayState.Free);
    });
});
