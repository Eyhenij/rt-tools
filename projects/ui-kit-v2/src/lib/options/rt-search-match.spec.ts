import { rtSearchFold, rtSearchMatches, rtSearchWords } from './rt-search-match';

describe('rt-search-match', (): void => {
    it('SC-UKV-874 — the words of a query find a row in any order', (): void => {
        expect(rtSearchMatches('Отчёт за март', 'март отчёт')).toBe(true);
        expect(rtSearchMatches('Мегамаркет', 'марк')).toBe(true);
    });

    it('SC-UKV-875 — a missing word drops the row', (): void => {
        expect(rtSearchMatches('Отчёт за март', 'отчёт апрель')).toBe(false);
    });

    it('SC-UKV-876 — case and «ё» do not matter', (): void => {
        expect(rtSearchMatches('Ёлка', 'елка')).toBe(true);
        expect(rtSearchMatches('ЕЛКА', 'ЁЛКА')).toBe(true);
        expect(rtSearchMatches('Press release', 'PRESS')).toBe(true);
    });

    it('SC-UKV-877 — a query of spaces keeps every row', (): void => {
        expect(rtSearchMatches('Любая подпись', '')).toBe(true);
        expect(rtSearchMatches('Любая подпись', '   ')).toBe(true);
        expect(rtSearchWords('  \t ')).toEqual([]);
    });

    it('the folded text keeps the length of the original', (): void => {
        expect(rtSearchFold('Ёлка в ЁМКОСТИ')).toBe('елка в емкости');
        expect(rtSearchFold('Ёлка в ЁМКОСТИ')).toHaveLength('Ёлка в ЁМКОСТИ'.length);
    });
});
