import { ISideMenu } from '../side-menu.types';
import {
    favoritesSection,
    findFavoriteItems,
    isFavoriteCandidate,
    moveFavorite,
    moveVisibleFavorite,
    normalizeFavorites,
} from './favorites.logic';
import { parseSettings } from '../settings/side-menu-settings.logic';

const MENU: ReadonlyArray<ISideMenu.Item> = [
    {
        id: 'cargo',
        name: 'Груз',
        submenu: [
            { id: 'a', name: 'Предложения', link: '/a' },
            { id: 'folder', name: 'Папка', submenu: [{ id: 'c', name: 'Сводки', link: '/c' }] },
        ],
    },
    { id: 'trees', name: 'Деревья', submenu: [{ id: 'b', name: 'Приглашения', link: '/b' }] },
    { id: 'home', name: 'Главная', link: '/' },
];

function idsOf(items: ReadonlyArray<ISideMenu.Item>): ISideMenu.FavoriteId[] {
    return items.map((item: ISideMenu.Item): ISideMenu.FavoriteId => item.id);
}

describe('parseSettings', (): void => {
    it('SC-UK-70 — не JSON читается пустыми настройками', (): void => {
        expect(parseSettings('{not json')).toEqual({});
    });

    it('SC-UK-70 — JSON не объект читается пустыми настройками', (): void => {
        expect(parseSettings('["a", 1]')).toEqual({});
        expect(parseSettings('7')).toEqual({});
    });

    it('SC-UK-70 — пустое хранилище даёт пустые настройки', (): void => {
        expect(parseSettings(null)).toEqual({});
    });

    it('SC-UK-71 — чужие значения и повторы отбрасываются, 1 и "1" — разные номера', (): void => {
        expect(parseSettings('{"main": {"favorites": ["a", 1, null, {"x": 1}, "a", "1"]}}')).toEqual({
            main: { favorites: ['a', 1, '1'] },
        });
    });

    it('SC-UK-71 — меню со сломанным значением пропускается, соседнее читается', (): void => {
        expect(parseSettings('{"main": {"favorites": ["a"]}, "broken": [1], "bare": {"favorites": "a"}}')).toEqual({
            main: { favorites: ['a'] },
            bare: {},
        });
    });
});

describe('normalizeFavorites', (): void => {
    it('SC-UK-74 — повтор при замене списка отбрасывается', (): void => {
        expect(normalizeFavorites(['c', 'c', 'd'])).toEqual(['c', 'd']);
    });
});

describe('moveFavorite', (): void => {
    it('SC-UK-73 — запись встаёт на новое место, остальные сохраняют порядок', (): void => {
        expect(moveFavorite(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    });

    it('SC-UK-73 — источник вне списка ничего не меняет, цель прижимается к краю', (): void => {
        expect(moveFavorite(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
        expect(moveFavorite(['a', 'b', 'c'], 0, 99)).toEqual(['b', 'c', 'a']);
    });
});

describe('moveVisibleFavorite', (): void => {
    it('SC-UK-87 — скрытый номер остаётся на своём месте', (): void => {
        expect(moveVisibleFavorite(['a', 'gone', 'b'], ['a', 'b'], 1, 0)).toEqual(['b', 'gone', 'a']);
    });

    it('SC-UK-84 — без скрытых перенос блока равен переносу списка', (): void => {
        expect(moveVisibleFavorite(['a', 'b', 'c'], ['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    });
});

describe('findFavoriteItems', (): void => {
    it('SC-UK-79 — раздел отдаёт только свои пункты, в том числе из папок, в порядке списка', (): void => {
        expect(idsOf(findFavoriteItems([MENU[0]], ['c', 'b', 'a']))).toEqual(['c', 'a']);
    });

    it('SC-UK-80 — номер, которого в меню нет, пропускается', (): void => {
        expect(idsOf(findFavoriteItems(MENU, ['gone', 'a']))).toEqual(['a']);
    });

    it('SC-UK-76 — папка и пункт полосы в избранное не попадают', (): void => {
        expect(findFavoriteItems(MENU, ['folder', 'home'])).toEqual([]);
    });
});

describe('isFavoriteCandidate', (): void => {
    it('SC-UK-76 — пункт со ссылкой может стоять в избранном, папка и строка возврата — нет', (): void => {
        expect(isFavoriteCandidate({ id: 'a', link: '/a' })).toBe(true);
        expect(isFavoriteCandidate({ id: 'folder', submenu: [] })).toBe(false);
        expect(isFavoriteCandidate({ id: 0, link: ' ' })).toBe(false);
    });

    it('SC-UK-93 — раздел показанного подменю отдаётся, только если избранное у него включено', (): void => {
        const on: ISideMenu.Item = { ...MENU[0], favorites: true };
        const menu: ISideMenu.Item[] = [on, MENU[1]];

        expect(favoritesSection(menu, on.submenu ?? [])).toBe(on);
        expect(favoritesSection(menu, MENU[1].submenu ?? [])).toBeNull();
    });

    it('SC-UK-96 — пустой показанный набор не принадлежит ни одному разделу', (): void => {
        expect(favoritesSection([{ ...MENU[0], favorites: true }], [])).toBeNull();
    });

    it('SC-UK-97 — раздел узнаётся и по номерам, когда меню передали заново новыми объектами', (): void => {
        const shown: ISideMenu.Item[] = MENU[0].submenu ?? [];
        const rebuilt: ISideMenu.Item[] = MENU.map((item: ISideMenu.Item): ISideMenu.Item => ({
            ...item,
            favorites: true,
            submenu: [...(item.submenu ?? [])],
        }));

        expect(favoritesSection(rebuilt, shown)?.id).toBe('cargo');
    });
});
