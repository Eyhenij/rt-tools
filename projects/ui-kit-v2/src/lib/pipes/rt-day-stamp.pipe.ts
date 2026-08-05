import { formatDate } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

/**
 * Штамп последнего взаимодействия для превью списков чатов: событие за сегодня
 * показывается временем («14:05»), за вчера и ранее — датой («18.07.2026»), чтобы
 * старые чаты не выглядели сегодняшними (G121).
 */
@Pipe({ name: 'rtDayStamp' })
export class RtDayStampPipe implements PipeTransform {
    readonly #locale: string = inject(LOCALE_ID);

    public transform(value: Date | string | null): string {
        if (value == null || value === '') {
            return '—';
        }
        const date: Date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '—';
        }
        const now: Date = new Date();
        const isToday: boolean =
            date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
        return formatDate(date, isToday ? 'HH:mm' : 'dd.MM.yyyy', this.#locale);
    }
}
