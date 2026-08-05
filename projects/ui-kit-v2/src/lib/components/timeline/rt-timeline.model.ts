export namespace IRtTimeline {
    /**
     * Статус шага:
     * - `complete` — пройденный шаг (заполненная точка);
     * - `current` — активный/последний шаг (увеличенная подсвеченная точка);
     * - `pending` — предстоящий шаг (полая точка).
     */
    export type Status = 'complete' | 'current' | 'pending';

    export interface Step {
        /** Заголовок шага. */
        label: string;
        /** Вторичная строка (время/детали); пусто — не рендерится. */
        meta?: string;
        /** Инициатор действия; пусто — не рендерится. */
        actor?: string;
        status: Status;
    }
}
