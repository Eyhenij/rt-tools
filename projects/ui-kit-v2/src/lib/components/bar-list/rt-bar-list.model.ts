/**
 * Контракты `rt-bar-list` — список «топ-N» со шкалой доли.
 * Компонент ничего не считает: доля приходит посчитанной, значение — строкой.
 */
export namespace IRtBarList {
    export interface Row {
        readonly id: string;
        readonly title: string;
        /** Уточнение под заголовком; пусто — строка не рендерится. */
        readonly meta?: string;
        /** Уже отформатированное значение справа. */
        readonly value: string;
        /** Длина шкалы, 0…100. */
        readonly sharePercent: number;
    }
}
