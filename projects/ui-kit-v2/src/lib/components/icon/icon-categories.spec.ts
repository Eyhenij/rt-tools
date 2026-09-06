import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { categoryOf, CATEGORY_ORDER } from './icon-categories';
import { iconsName } from './rt-icon-names';
import { IRtIcon } from './rt-icon.model';

const ICONS_DIR: string = join(__dirname, '../../../assets/icons');

const SOCIAL_NAMES: readonly IRtIcon.Name[] = iconsName.filter((name: IRtIcon.Name): boolean => name.startsWith('social-'));

describe('набор значков', (): void => {
    it('у каждого имени набора есть файл — иначе промах виден только глазами', (): void => {
        const missing: readonly string[] = iconsName.filter((name: IRtIcon.Name): boolean => !existsSync(join(ICONS_DIR, `${name}.svg`)));

        expect(missing).toEqual([]);
    });

    it('знаков соцсетей двенадцать, и все они в категории Social', (): void => {
        expect(SOCIAL_NAMES.length).toBe(12);
        expect(SOCIAL_NAMES.every((name: IRtIcon.Name): boolean => categoryOf(name) === 'Social')).toBe(true);
    });

    it('одноцветный значок в Social не попадает', (): void => {
        expect(categoryOf('telegram')).toBe('Communication');
        expect(categoryOf('ico-telegram')).toBe('Custom');
    });

    it('Social стоит в порядке каталога перед Custom', (): void => {
        expect(CATEGORY_ORDER.indexOf('Social')).toBeLessThan(CATEGORY_ORDER.indexOf('Custom'));
    });

    it('цвет знака соцсети задан в файле, а не темой', (): void => {
        // Одноцветный набор красится через currentColor; у фирменного знака заливка своя,
        // и вход color компонента на него не действует — это и есть его род.
        for (const name of SOCIAL_NAMES) {
            const svg: string = readFileSync(join(ICONS_DIR, `${name}.svg`), 'utf8');

            expect(svg).not.toContain('currentColor');
            expect(svg).toMatch(/fill="(#[0-9A-Fa-f]{6}|url\(#rt-icon-social-)/);
        }
    });
});
