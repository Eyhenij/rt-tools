/**
 * Снятые имена против живого набора.
 *
 * Оба утверждения проверяются по диску, а не по списку: список ведётся руками, и его совпадение
 * с самим собой ничего не значит. Ресурс, снятый из набора наполовину — файла нет, а имя его в
 * тексте соседа осталось, — уезжает к потребителю указанием завести то, чего в пакете больше нет.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { IEntryOfCatalog, readCatalog } from './catalog.js';
import { IRetired, RETIRED } from './retired.js';

const ASSETS: string = join(__dirname, '..', '..', 'assets');

/** Последнее звено имени: им ресурсы и ссылаются друг на друга. */
const shortOf: (one: IRetired) => string = (one: IRetired): string => one.name.split('/').pop() ?? one.name;

/** Все файлы набора: снятое имя ищется по тексту любого из них, а не только правил и паттернов. */
function filesIn(dir: string): readonly string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry: { name: string; isDirectory: () => boolean }): readonly string[] =>
        entry.isDirectory() ? filesIn(join(dir, entry.name)) : [join(dir, entry.name)]
    );
}

describe('RETIRED', () => {
    it('SC-AK-126 — снятых законов в наборе пакета нет', () => {
        const ids: ReadonlySet<string> = new Set(readCatalog(ASSETS).map((entry: IEntryOfCatalog): string => entry.id));

        expect(RETIRED.filter((one: IRetired): boolean => ids.has(one.id)).map((one: IRetired): string => one.id)).toEqual([]);
    });

    it('SC-AK-139 — поимённых ссылок на снятые имена в наборе не остаётся', () => {
        const found: string[] = [];
        for (const path of filesIn(ASSETS)) {
            const text: string = readFileSync(path, 'utf8');
            for (const one of RETIRED) {
                if (text.includes(shortOf(one))) {
                    found.push(`${path.slice(ASSETS.length + 1)} → ${shortOf(one)}`);
                }
            }
        }

        expect(found).toEqual([]);
    });
});
