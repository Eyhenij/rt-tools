import { rtMatchParts } from './rt-match-parts';

describe('rt-match-parts', (): void => {
    it('SC-UKV-877 — a query of spaces marks nothing', (): void => {
        expect(rtMatchParts('Курсы валют', '')).toEqual([{ text: 'Курсы валют', matched: false }]);
        expect(rtMatchParts('Курсы валют', '   ')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('SC-UKV-878 — the highlight marks every word, overlaps as one piece', (): void => {
        expect(rtMatchParts('Мегамаркет Ёлка', 'мега гама елка')).toEqual([
            { text: 'Мегама', matched: true },
            { text: 'ркет ', matched: false },
            { text: 'Ёлка', matched: true },
        ]);
    });

    it('a query the label does not hold marks nothing', (): void => {
        expect(rtMatchParts('Курсы валют', 'налог')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('exactly the found piece is marked, in the case it was written in', (): void => {
        expect(rtMatchParts('Курсы валют', 'валют')).toEqual([
            { text: 'Курсы ', matched: false },
            { text: 'валют', matched: true },
        ]);
        expect(rtMatchParts('Press release', 'PRESS')).toEqual([
            { text: 'Press', matched: true },
            { text: ' release', matched: false },
        ]);
    });

    it('every occurrence is marked, not the first', (): void => {
        expect(rtMatchParts('Мега меню', 'ме')).toEqual([
            { text: 'Ме', matched: true },
            { text: 'га ', matched: false },
            { text: 'ме', matched: true },
            { text: 'ню', matched: false },
        ]);
    });

    it('words of a query in another order are marked each', (): void => {
        expect(rtMatchParts('Курсы валют', 'валют курсы')).toEqual([
            { text: 'Курсы', matched: true },
            { text: ' ', matched: false },
            { text: 'валют', matched: true },
        ]);
    });

    it('an empty label gives no pieces: there is nothing to draw', (): void => {
        expect(rtMatchParts('', 'ме')).toEqual([]);
    });
});
