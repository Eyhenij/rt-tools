/**
 * Контракты `rt-carousel` — стопки цветных карточек с короткой подписью.
 */
export namespace IRtCarousel {
    /** Карточка входа: подпись и цвет `#rgb` или `#rrggbb`. Без цвета карточка стоит на фоне кита. */
    export interface Card {
        readonly label: string;
        readonly color?: string | null;
    }

    /**
     * Регистр подписи: как пришла или каждое слово с заглавной и строчными дальше — так приложение
     * пишет «AI» как «Ai».
     */
    export type LabelCase = 'as-is' | 'title';

    /** Тон подписи: тёмный на светлом цвете, светлый на тёмном. */
    export type Tone = 'dark' | 'light';

    /** Карточка, какой её рисует шаблон: цвет приведён к `#rrggbb`, тон подписи посчитан. */
    export interface View {
        readonly label: string;
        readonly color: string | null;
        readonly tone: Tone | null;
    }
}
