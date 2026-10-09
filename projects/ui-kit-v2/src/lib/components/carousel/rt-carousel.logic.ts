import { IRtCarousel } from './rt-carousel.model';

/** Цвет записью `#rgb` или `#rrggbb`, в любом регистре. */
const HEX_PATTERN: RegExp = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Порог яркости правила приложения: выше него подпись тёмная. */
const BRIGHTNESS_LIMIT: number = 186;

/**
 * Цвет карточки как `#rrggbb` строчными. Трёхзначная запись разворачивается до шести знаков; всё,
 * что не цвет такой записью, — `null`, и карточка остаётся на фоне кита.
 */
export function carouselHex(color: string | null | undefined): string | null {
    const value: string = (color ?? '').trim();
    if (!HEX_PATTERN.test(value)) {
        return null;
    }
    const digits: string = value.slice(1).toLowerCase();
    return digits.length === 3 ? `#${[...digits].map((digit: string): string => digit + digit).join('')}` : `#${digits}`;
}

/**
 * Тон подписи по яркости цвета — то же правило, каким приложение выбирало цвет текста:
 * `0.299·R + 0.587·G + 0.114·B` выше 186 даёт тёмную подпись, иначе светлую.
 */
export function carouselTone(hex: string | null): IRtCarousel.Tone | null {
    if (hex === null) {
        return null;
    }
    const channel: (from: number) => number = (from: number): number => parseInt(hex.slice(from, from + 2), 16);
    const brightness: number = 0.299 * channel(1) + 0.587 * channel(3) + 0.114 * channel(5);
    return brightness > BRIGHTNESS_LIMIT ? 'dark' : 'light';
}

/** Карточки входа в том виде, какой рисует шаблон. */
export function carouselViews(cards: readonly IRtCarousel.Card[]): readonly IRtCarousel.View[] {
    return cards.map((card: IRtCarousel.Card): IRtCarousel.View => {
        const color: string | null = carouselHex(card.color);
        return { color, label: card.label, tone: carouselTone(color) };
    });
}
