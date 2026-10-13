import { carouselHex, carouselLabel, carouselTone, carouselViews } from './rt-carousel.logic';
import { IRtCarousel } from './rt-carousel.model';

describe('rt-carousel logic', (): void => {
    it.each<[string | null | undefined, string | null]>([
        ['#1E88E5', '#1e88e5'],
        ['#fc0', '#ffcc00'],
        [' #123456 ', '#123456'],
        ['red', null],
        ['1e88e5', null],
        ['#12345', null],
        ['', null],
        [null, null],
        [undefined, null],
    ])('SC-UKV-826 — цвет %p читается как %p', (color: string | null | undefined, hex: string | null): void => {
        expect(carouselHex(color)).toBe(hex);
    });

    it.each<[string, IRtCarousel.Tone]>([
        ['#ffffff', 'dark'],
        ['#ffcc00', 'dark'],
        ['#bbbbbb', 'dark'],
        ['#bababa', 'light'],
        ['#1e88e5', 'light'],
        ['#000000', 'light'],
    ])('SC-UKV-827 — на цвете %s подпись %s', (hex: string, tone: IRtCarousel.Tone): void => {
        expect(carouselTone(hex)).toBe(tone);
    });

    it('SC-UKV-827 — у карточки без цвета тона нет', (): void => {
        expect(carouselTone(null)).toBeNull();
    });

    it('SC-UKV-825 — карточки идут в порядке входа, каждая со своим цветом и тоном', (): void => {
        expect(carouselViews([{ label: 'Admin', color: '#FC0' }, { label: 'Reader' }, { label: 'Owner', color: '#000' }])).toEqual([
            { color: '#ffcc00', label: 'Admin', tone: 'dark' },
            { color: null, label: 'Reader', tone: null },
            { color: '#000000', label: 'Owner', tone: 'light' },
        ]);
    });

    it('SC-UKV-849 — регистр title пишет слово с заглавной и строчными дальше, as-is не трогает', (): void => {
        expect(carouselLabel('AI tools', 'title')).toBe('Ai Tools');
        expect(carouselLabel('USER  management', 'title')).toBe('User  Management');
        expect(carouselLabel('доступ К ОТЧЁТАМ', 'title')).toBe('Доступ К Отчётам');
        expect(carouselLabel('AI tools', 'as-is')).toBe('AI tools');
        expect(carouselViews([{ label: 'AI' }], 'title')[0].label).toBe('Ai');
        expect(carouselViews([{ label: 'AI' }])[0].label).toBe('AI');
    });
});
