import { IRtSideMenu } from './rt-side-menu.model';
import {
    sideMenuFavoritesSection,
    findSideMenuFavoriteItems,
    isSideMenuFavoriteCandidate,
    moveSideMenuFavorite,
    moveVisibleSideMenuFavorite,
    normalizeSideMenuFavorites,
} from './rt-side-menu-favorites.logic';
import { readSideMenuSettings } from './rt-side-menu-settings.logic';

const MENU: ReadonlyArray<IRtSideMenu.Item> = [
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

function idsOf(items: ReadonlyArray<IRtSideMenu.Item>): IRtSideMenu.FavoriteId[] {
    return items.map((item: IRtSideMenu.Item): IRtSideMenu.FavoriteId => item.id);
}

describe('readSideMenuSettings — избранное', (): void => {
    it('SC-UKV-526 — чужие значения и повторы отбрасываются, 1 и "1" — разные номера', (): void => {
        expect(readSideMenuSettings({ main: { favorites: ['a', 1, null, { x: 1 }, 'a', '1'] } })).toEqual({
            main: { favorites: ['a', 1, '1'] },
        });
    });

    it('SC-UKV-526 — список не массивом читается отсутствием списка, соседнее поле остаётся', (): void => {
        expect(readSideMenuSettings({ main: { favorites: 'a', subMenuMode: 'pinned' } })).toEqual({ main: { subMenuMode: 'pinned' } });
    });

    it('SC-UKV-526 — свёрнутые блоки читаются тем же отбором', (): void => {
        expect(readSideMenuSettings({ main: { favoritesCollapsed: [1, 1, true, 'x'] } })).toEqual({
            main: { favoritesCollapsed: [1, 'x'] },
        });
    });
});

describe('normalizeSideMenuFavorites', (): void => {
    it('SC-UKV-527 — повтор при замене списка отбрасывается', (): void => {
        expect(normalizeSideMenuFavorites(['c', 'c', 'd'])).toEqual(['c', 'd']);
    });
});

describe('moveSideMenuFavorite', (): void => {
    it('SC-UKV-527 — запись встаёт на новое место, остальные сохраняют порядок', (): void => {
        expect(moveSideMenuFavorite(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    });

    it('SC-UKV-527 — источник вне списка ничего не меняет, цель прижимается к краю', (): void => {
        expect(moveSideMenuFavorite(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
        expect(moveSideMenuFavorite(['a', 'b', 'c'], 0, 99)).toEqual(['b', 'c', 'a']);
    });
});

describe('moveVisibleFavorite', (): void => {
    it('SC-UKV-527 — скрытый номер остаётся на своём месте', (): void => {
        expect(moveVisibleSideMenuFavorite(['a', 'gone', 'b'], ['a', 'b'], 1, 0)).toEqual(['b', 'gone', 'a']);
    });

    it('SC-UKV-527 — без скрытых перенос блока равен переносу списка', (): void => {
        expect(moveVisibleSideMenuFavorite(['a', 'b', 'c'], ['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    });
});

describe('findSideMenuFavoriteItems', (): void => {
    it('SC-UKV-528 — раздел отдаёт только свои пункты, в том числе из папок, в порядке списка', (): void => {
        expect(idsOf(findSideMenuFavoriteItems([MENU[0]], ['c', 'b', 'a']))).toEqual(['c', 'a']);
    });

    it('SC-UKV-528 — номер, которого в меню нет, пропускается', (): void => {
        expect(idsOf(findSideMenuFavoriteItems(MENU, ['gone', 'a']))).toEqual(['a']);
    });

    it('SC-UKV-529 — папка и пункт полосы в избранное не попадают', (): void => {
        expect(findSideMenuFavoriteItems(MENU, ['folder', 'home'])).toEqual([]);
    });
});

describe('isSideMenuFavoriteCandidate', (): void => {
    it('SC-UKV-529 — пункт со ссылкой и флагом favoriteDisabled в избранном стоять не может', (): void => {
        expect(isSideMenuFavoriteCandidate({ id: 'create', link: '/create', favoriteDisabled: true })).toBe(false);
        expect(isSideMenuFavoriteCandidate({ id: 'create', link: '/create', favoriteDisabled: false })).toBe(true);
    });

    it('SC-UKV-529 — номер пункта с флагом favoriteDisabled в блок не попадает', (): void => {
        const menu: IRtSideMenu.Item[] = [
            {
                id: 'cargo',
                submenu: [
                    { id: 'a', link: '/a' },
                    { id: 'b', link: '/b', favoriteDisabled: true },
                ],
            },
        ];

        expect(findSideMenuFavoriteItems(menu, ['b', 'a']).map((item: IRtSideMenu.Item): IRtSideMenu.FavoriteId => item.id)).toEqual(['a']);
    });

    it('SC-UKV-529 — пункт со ссылкой может стоять в избранном, папка и строка возврата — нет', (): void => {
        expect(isSideMenuFavoriteCandidate({ id: 'a', link: '/a' })).toBe(true);
        expect(isSideMenuFavoriteCandidate({ id: 'folder', submenu: [] })).toBe(false);
        expect(isSideMenuFavoriteCandidate({ id: 0, link: ' ' })).toBe(false);
    });

    it('SC-UKV-530 — раздел показанного подменю отдаётся, только если избранное у него включено', (): void => {
        const on: IRtSideMenu.Item = { ...MENU[0], favorites: true };
        const menu: IRtSideMenu.Item[] = [on, MENU[1]];

        expect(sideMenuFavoritesSection(menu, on.submenu ?? [])).toBe(on);
        expect(sideMenuFavoritesSection(menu, MENU[1].submenu ?? [])).toBeNull();
    });

    it('SC-UKV-530 — пустой показанный набор не принадлежит ни одному разделу', (): void => {
        expect(sideMenuFavoritesSection([{ ...MENU[0], favorites: true }], [])).toBeNull();
    });

    it('SC-UKV-530 — раздел узнаётся и по номерам, когда меню передали заново новыми объектами', (): void => {
        const shown: IRtSideMenu.Item[] = MENU[0].submenu ?? [];
        const rebuilt: IRtSideMenu.Item[] = MENU.map((item: IRtSideMenu.Item): IRtSideMenu.Item => ({
            ...item,
            favorites: true,
            submenu: [...(item.submenu ?? [])],
        }));

        expect(sideMenuFavoritesSection(rebuilt, shown)?.id).toBe('cargo');
    });
});
