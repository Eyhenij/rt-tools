/**
 * Модель компонента rt-logo.
 *
 * - `wordmark` — только начертание названия;
 * - `lockup` — начертание в композиции со слоганом под ним; слоган ужимается до
 *   ширины начертания.
 */
export namespace IRtLogo {
    export type Variant = 'wordmark' | 'lockup';
}
