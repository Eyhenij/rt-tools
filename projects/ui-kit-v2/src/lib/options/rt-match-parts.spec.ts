import { rtMatchParts, rtMatchPartsByWords } from './rt-match-parts';

describe('отметка совпавшего в подписи', () => {
    it('пустой запрос ничего не отмечает', () => {
        expect(rtMatchParts('Курсы валют', '')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('запрос, которого в подписи нет, ничего не отмечает', () => {
        expect(rtMatchParts('Курсы валют', 'налог')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('отмечено ровно найденное, а не вся подпись', () => {
        expect(rtMatchParts('Курсы валют', 'валют')).toEqual([
            { text: 'Курсы ', matched: false },
            { text: 'валют', matched: true },
        ]);
    });

    it('регистр подписи остаётся тем, каким его написал потребитель', () => {
        expect(rtMatchParts('Press release', 'PRESS')).toEqual([
            { text: 'Press', matched: true },
            { text: ' release', matched: false },
        ]);
    });

    it('отмечены все вхождения, а не первое', () => {
        expect(rtMatchParts('Мега меню', 'ме')).toEqual([
            { text: 'Ме', matched: true },
            { text: 'га ', matched: false },
            { text: 'ме', matched: true },
            { text: 'ню', matched: false },
        ]);
    });

    it('запрос из одних пробелов ничего не отмечает: отбор их тоже не считает запросом', () => {
        expect(rtMatchParts('Курсы валют', '   ')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });

    it('пустая подпись отдаёт пустой список: рисовать нечего', () => {
        expect(rtMatchParts('', 'ме')).toEqual([]);
    });
});

describe('отметка каждого слова запроса', () => {
    it('отмечено каждое слово, в каком бы порядке оно ни стояло', () => {
        expect(rtMatchPartsByWords('Курсы валют', 'валют курсы')).toEqual([
            { text: 'Курсы', matched: true },
            { text: ' ', matched: false },
            { text: 'валют', matched: true },
        ]);
    });

    it('слово внутри отмеченного куска не режет его второй раз', () => {
        expect(rtMatchPartsByWords('Мегамаркет', 'мегамаркет мега')).toEqual([{ text: 'Мегамаркет', matched: true }]);
    });

    it('пустой запрос ничего не отмечает', () => {
        expect(rtMatchPartsByWords('Курсы валют', '  ')).toEqual([{ text: 'Курсы валют', matched: false }]);
    });
});
