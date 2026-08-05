/**
 * Модель `<rt-spinner>`: один корневой неймспейс с префиксом `I`.
 *
 * `Color` — семантическая палитра spinner'а:
 *  - `primary`   — синий основной (action accent), default
 *  - `neutral`   — нейтральный серый (для тонких inline-loader'ов)
 *  - `on-primary` — белый (для overlay поверх primary-фона)
 */
export namespace IRtSpinner {
    export type Color = 'primary' | 'neutral' | 'on-primary';
}
