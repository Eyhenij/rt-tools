import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { RtDayStampPipe } from './rt-day-stamp.pipe';

/**
 * Язык берётся внедрением, поэтому пайп поднимается в области внедрения, а не конструктором.
 *
 * Язык здесь английский: данные любого другого регистрирует приложение вызовом
 * `registerLocaleData`, и без них пайп падает `Missing locale data`. Формат штампа задан
 * шаблоном (`HH:mm`, `dd.MM.yyyy`), и от языка он не зависит — зависит только доступность
 * данных.
 */
function stamp(value: Date | string | null): string {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'en-US' }] });

    return TestBed.runInInjectionContext((): string => new RtDayStampPipe().transform(value));
}

/** Сегодняшний момент с заданным временем — дата берётся от часов машины, а не записывается числом. */
function todayAt(hours: number, minutes: number): Date {
    const date: Date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date;
}

describe('RtDayStampPipe', (): void => {
    it('пустое значение показывает прочерком', (): void => {
        expect(stamp(null)).toBe('—');
        expect(stamp('')).toBe('—');
    });

    it('нечитаемую дату показывает прочерком, а не словом Invalid Date', (): void => {
        expect(stamp('вчера вечером')).toBe('—');
    });

    it('сегодняшнее событие показывает временем', (): void => {
        expect(stamp(todayAt(14, 5))).toBe('14:05');
    });

    it('вчерашнее событие показывает датой — иначе старый чат выглядел бы сегодняшним', (): void => {
        const yesterday: Date = todayAt(14, 5);

        yesterday.setDate(yesterday.getDate() - 1);

        const expected: string = [
            String(yesterday.getDate()).padStart(2, '0'),
            String(yesterday.getMonth() + 1).padStart(2, '0'),
            String(yesterday.getFullYear()),
        ].join('.');

        expect(stamp(yesterday)).toBe(expected);
    });

    it('дату строкой разбирает так же, как объект даты', (): void => {
        const moment: Date = todayAt(9, 30);

        expect(stamp(moment.toISOString())).toBe(stamp(moment));
    });
});
