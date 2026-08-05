/**
 * Контракты `rt-calendar` — презентационный месячный грид с range-выбором.
 *
 * Компонент домен-агностичен: состояния/цены/доступность дней вычисляет
 * consumer и передаёт готовые view-модели месяцев. Клики по дням и навигация
 * по месяцам эмитятся наружу; никакой доменной логики внутри нет.
 */

/** Состояние ячейки дня — модификатор `data-state` на кнопке дня. */
export enum ERtCalendarDayState {
    Free = 'free',
    Busy = 'busy',
    Past = 'past',
    Blocked = 'blocked',
    Start = 'start',
    End = 'end',
    InRange = 'in-range',
}

export namespace IRtCalendar {
    /** View-модель дня. `key` — стабильный ключ (ISO-дата). */
    export interface Day {
        key: string;
        dayOfMonth: number;
        /** Подпись под числом (цена за ночь и т.п.); пустая строка не рендерится. */
        sublabel: string;
        state: ERtCalendarDayState;
        disabled: boolean;
    }

    /** View-модель месяца: подпись, пустые ячейки до первого дня, дни. */
    export interface Month {
        key: string;
        label: string;
        leadingBlanks: readonly number[];
        days: readonly Day[];
    }
}
