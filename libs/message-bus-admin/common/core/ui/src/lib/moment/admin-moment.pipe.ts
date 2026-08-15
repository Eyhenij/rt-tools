import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@rt-tools/utils';

/** Как показывается время: день и минуты. Секунды человеку в списке ни о чём не говорят. */
const MOMENT_FORMAT: string = 'dd.MM.yyyy HH:mm';

/** Чем заменяется время, которого нет или которое не разобралось. */
const NO_MOMENT: string = '—';

/**
 * Время в поясе того, кто смотрит.
 *
 * Хранится время во всемирном, а показывается местным: пояс, выбранный молча, сдвигает порядок
 * «свежие сверху» на границе суток — запись, приехавшая вечером, встаёт завтрашним днём.
 *
 * Пайп, а не готовое значение модели: время показывает ячейка таблицы, а значение приходит ей из
 * контекста шаблона — вычислить его заранее негде.
 */
@Pipe({ name: 'adminMoment' })
export class AdminMomentPipe implements PipeTransform {
    public transform(value: Date | null): string {
        if (value === null || Number.isNaN(value.getTime())) {
            return NO_MOMENT;
        }

        return formatDate(value, MOMENT_FORMAT);
    }
}
