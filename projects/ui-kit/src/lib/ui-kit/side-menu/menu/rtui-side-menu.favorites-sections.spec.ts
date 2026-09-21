import { ISideMenu } from '../side-menu.types';
import { clickRailItem, installFontsStub, menu } from './side-menu.harness';
import { BLOCK, blockRowIds, drop, hoverItem, listRow, SECTIONS, STAR, withFavorites } from './side-menu-favorites.harness';

beforeAll(installFontsStub);

// Закреплённое подменю доводит активный пункт до видимой части, а движок тестов прокрутки не знает.
beforeAll((): void => {
    Element.prototype.scrollIntoView = jest.fn();
});

describe('RtuiSideMenuComponent — избранное: раздел', () => {
    it('SC-UK-79 — блок показывает только избранное открытого раздела, в порядке списка', () => {
        const { fixture } = withFavorites(['c', 'b', 'a'], { items: SECTIONS });

        hoverItem(fixture, 0);
        expect(blockRowIds(fixture)).toEqual(['b', 'a']);

        hoverItem(fixture, 1);
        expect(blockRowIds(fixture)).toEqual(['c']);
    });

    it('SC-UK-93 — раздел без флага не показывает ни звёзд, ни блока, хотя список не пуст', () => {
        const { fixture } = withFavorites(['a', 'x'], { items: SECTIONS });

        hoverItem(fixture, 2);

        expect(listRow(fixture, 'x')).not.toBeNull();
        expect(fixture.nativeElement.querySelector(STAR)).toBeNull();
        expect(fixture.nativeElement.querySelector(BLOCK)).toBeNull();
    });

    it('SC-UK-96 — подменю пункта с пустым набором не показывает избранное другого раздела', () => {
        const items: ISideMenu.Item[] = [...SECTIONS, { id: 'empty', name: 'Пусто', icon: 'block', favorites: true, submenu: [] }];
        const { fixture } = withFavorites(['a', 'b'], { items, active: ['cargo', 'a'] });

        hoverItem(fixture, 0);
        expect(blockRowIds(fixture)).toEqual(['a', 'b']);

        hoverItem(fixture, 3);
        expect(menu(fixture).selectedSubMenu()).toEqual([]);
        expect(fixture.nativeElement.querySelector(BLOCK)).toBeNull();
    });

    it('SC-UK-97 — меню, переданное заново новыми объектами, не гасит блок и звёзды', () => {
        const { fixture, host } = withFavorites(['b', 'a'], { items: SECTIONS });

        hoverItem(fixture, 0);
        expect(blockRowIds(fixture)).toEqual(['b', 'a']);

        host.items.set(
            SECTIONS.map((item: ISideMenu.Item): ISideMenu.Item => ({
                ...item,
                submenu: (item.submenu ?? []).map((child: ISideMenu.Item) => ({ ...child })),
            }))
        );
        fixture.detectChanges();

        expect(blockRowIds(fixture)).toEqual(['b', 'a']);
        expect(fixture.nativeElement.querySelectorAll(STAR).length).toBe(2);
    });

    it('SC-UK-101 — закреплённое подменю берёт раздел выбранного пункта, а без выбора — активного', () => {
        const { fixture } = withFavorites(['a', 'c'], { items: SECTIONS, active: ['cargo', 'a'], mode: 'pinned' });

        expect(blockRowIds(fixture)).toEqual(['a']);

        clickRailItem(fixture, 2);
        expect(listRow(fixture, 'x')).not.toBeNull();
        expect(fixture.nativeElement.querySelector(STAR)).toBeNull();
        expect(fixture.nativeElement.querySelector(BLOCK)).toBeNull();

        clickRailItem(fixture, 1);
        expect(blockRowIds(fixture)).toEqual(['c']);
        expect(fixture.nativeElement.querySelectorAll(STAR).length).toBe(1);
    });

    it('SC-UK-102 — брошенная строка не сдвигает номера другого раздела', () => {
        const { fixture, favorites } = withFavorites(['a', 'c', 'b'], { items: SECTIONS });

        hoverItem(fixture, 0);
        drop(fixture, 1, 0);

        expect(blockRowIds(fixture)).toEqual(['b', 'a']);
        expect(favorites.ids()).toEqual(['b', 'c', 'a']);
    });
});
