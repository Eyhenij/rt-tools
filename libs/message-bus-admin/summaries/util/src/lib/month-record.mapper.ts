/**
 * Перевод записи месяца из ответа приёмника в то, чем пользуется экран.
 *
 * Маппер свой на каждый уровень: полный наследует короткий и добавляет к нему сводку — так поля,
 * общие обоим, переводятся одним объявлением и не расходятся при правке.
 *
 * Время приезжает строкой и становится временем здесь; сводка приезжает телом и становится
 * текстом здесь же. Оба перевода делаются один раз, а не в каждой перерисовке.
 */
import { ITreeChoice } from '@rt/message-bus-common';
import { BaseMapper } from '@rt-tools/utils';

import { IMonthRecord } from './month-record.model';

/** Отступ, которым сводка раскладывается по строкам. Без него всё тело идёт одной строкой. */
const SUMMARY_INDENT: number = 4;

/** Ограда, которой сводка объявляется блоком кода. Язык назван читателю: на вид он не влияет. */
const SUMMARY_FENCE_OPEN: string = '```json';

/** Ограда, закрывающая блок кода сводки. */
const SUMMARY_FENCE_CLOSE: string = '```';

/** Дерево из ответа. Поля читаются по одному: чужой объект приводить целиком нельзя. */
function treeOf(mapper: BaseMapper<unknown>, raw: ITreeChoice): ITreeChoice {
    return { slug: mapper.typeCast.getAsString(raw?.slug), name: mapper.typeCast.getAsString(raw?.name) };
}

/**
 * Сводка в текст, объявленный блоком кода.
 *
 * Тело у неё произвольной формы, и приведением к строке из него вышло бы `[object Object]`.
 * Пустая строка означает «сводки в этом месяце ещё не было» — то же, что ноль заходов; тело,
 * которое не разложить в текст, тоже даёт пустоту, а не роняет панель.
 *
 * Разметкой сводка не приезжает и приезжать не начнёт: дерево шлёт её полями, а текстом она
 * становится здесь. Ограда поэтому ставится здесь же — без неё панель показала бы тело абзацем,
 * а абзац схлопывает отступы, которыми оно и разложено.
 */
function summaryOf(raw: unknown): string {
    if (raw === null || raw === undefined) {
        return '';
    }

    try {
        const body: string = JSON.stringify(raw, null, SUMMARY_INDENT) ?? '';

        return body === '' ? '' : `${SUMMARY_FENCE_OPEN}\n${body}\n${SUMMARY_FENCE_CLOSE}`;
    } catch {
        return '';
    }
}

/** Строка списка. */
export class MonthRecordShortMapper extends BaseMapper<IMonthRecord.Short.State> {
    public override mapFrom(data: IMonthRecord.Short.Api): IMonthRecord.Short.State {
        return {
            id: this.typeCast.getAsString(data.id),
            tree: treeOf(this, data.tree),
            month: this.typeCast.getAsString(data.month),
            // Запасное значение обязательно: без него пустой счёт приходит на экран как NaN,
            // и в ячейке таблицы человек читает его вместо «сводки ещё не было».
            sessions: this.typeCast.getAsNumber(data.sessions, 0),
            ranAt: new Date(this.typeCast.getAsString(data.ranAt)),
        };
    }
}

/** Запись целиком. */
export class MonthRecordMapper extends BaseMapper<IMonthRecord.State> {
    readonly #short: MonthRecordShortMapper = new MonthRecordShortMapper();

    public override mapFrom(data: IMonthRecord.Api): IMonthRecord.State {
        return { ...this.#short.mapFrom(data), summary: summaryOf(data.summary) };
    }
}
