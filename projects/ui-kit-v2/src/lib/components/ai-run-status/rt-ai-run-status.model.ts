export namespace IRtAiRunStatus {
    /**
     * Состояние хода работы ассистента:
     * - `running` — модель работает: крутилка и бегущий блик по подписи;
     * - `done` — ответ готов;
     * - `stopped` — человек остановил ответ;
     * - `failed` — ответ оборвался ошибкой.
     */
    export type State = 'running' | 'done' | 'stopped' | 'failed';
}
