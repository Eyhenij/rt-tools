import { isKitIconName } from '../icon/rt-icon-glyph.logic';

import { dataTableIconName } from './rt-data-table-cell.logic';
import { DATA_TABLE_FILTER_OPERATOR_GLYPHS } from './rt-data-table-filter.logic';

describe('значки таблицы', (): void => {
    it('SC-UKV-1880 — виды сравнения фильтра названы именами кита', (): void => {
        const glyphs: string[] = Object.values(DATA_TABLE_FILTER_OPERATOR_GLYPHS).filter(
            (glyph: string | null): glyph is string => glyph !== null
        );

        expect(glyphs.length).toBeGreaterThan(0);
        expect(glyphs.filter((glyph: string): boolean => !isKitIconName(glyph))).toEqual([]);
    });

    it('SC-UKV-1880 — имя первого кита из колонки значка не даёт, а имя кита даёт', (): void => {
        expect(dataTableIconName('content_copy')).toBeNull();
        expect(dataTableIconName('copy')).toBe('copy');
    });
});
