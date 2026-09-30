import { EnvironmentProviders, inject, provideAppInitializer, Provider } from '@angular/core';

import { IRtSideMenuSettingsConfig, provideRtSideMenuSettings, RtSideMenuSettingsService } from '../../rt-side-menu-settings.service';
import { IRtSideMenu } from '../../rt-side-menu.model';
import { SIDE_MENU_STORY_ITEMS } from './side-menu-story-data';

/**
 * Данные историй избранного — те же, что в историях избранного первого кита: избранное включено у
 * «Content» и «Test long name», у «Collections» выключено. В «Content» разделы разложены по двум
 * вложенным папкам, у части разделов кнопка «+» создания записи. Значки Material заменены значками
 * кита по `rt-icon-material-map.ts`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
const FAVORITE_SECTIONS: ReadonlyArray<IRtSideMenu.Item['id']> = [1, 24];

const CONTENT_WITH_FOLDERS: IRtSideMenu.Item[] = [
    { id: 102, icon: 'images', name: 'Gallery', link: '/content', iconButton: { icon: 'ico-plus', data: '/content' } },
    { id: 2, name: 'News', link: '/content/news', iconButton: { icon: 'ico-plus', data: '/content/news' } },
    {
        id: 103,
        name: 'Quarterly reports for regional partners and distributors',
        link: '/content/quarterly-reports',
        iconButton: { icon: 'ico-plus', data: '/content/quarterly-reports' },
    },
    { id: 3, name: 'Learn', link: '/content/learn' },
    { id: 4, name: 'Review', link: '/content/review' },
    { id: 5, name: 'Press release', link: '/content/press-release' },
    { id: 104, name: 'Internal announcements archive for the whole organisation', link: '/content/announcements' },
    {
        id: 100,
        icon: 'folder',
        name: 'Layouts',
        submenu: [
            { id: 6, name: 'L1', link: '/content/l1' },
            { id: 7, name: 'L2', link: '/content/l2', iconButton: { icon: 'ico-plus', data: '/content/l2' } },
            { id: 8, name: 'L3', link: '/content/l3' },
            {
                id: 101,
                icon: 'folder',
                name: 'Navigation',
                submenu: [
                    { id: 9, name: 'Sidebar', link: '/content/sidebar', iconButton: { icon: 'ico-plus', data: '/content/sidebar' } },
                    { id: 10, name: 'Mega Menu', link: '/content/mega-menu' },
                ],
            },
        ],
    },
    { id: 11, name: 'Home page', link: '/content/home-page' },
];

/** Меню с избранным у «Content» (с папками) и «Test long name». */
export const FAVORITES_STORY_ITEMS: readonly IRtSideMenu.Item[] = SIDE_MENU_STORY_ITEMS.map((item: IRtSideMenu.Item): IRtSideMenu.Item => {
    if (!FAVORITE_SECTIONS.includes(item.id)) {
        return item;
    }

    return item.id === 1 ? { ...item, favorites: true, submenu: CONTENT_WITH_FOLDERS } : { ...item, favorites: true };
});

/** Меняет пункты подменю «Content», остальное меню оставляет как есть. */
function mapContent(items: readonly IRtSideMenu.Item[], edit: (sub: IRtSideMenu.Item) => IRtSideMenu.Item): IRtSideMenu.Item[] {
    return items.map((item: IRtSideMenu.Item): IRtSideMenu.Item =>
        item.id === 1 ? { ...item, submenu: (item.submenu ?? []).map(edit) } : item
    );
}

/** «Content», где у корня раздела «Gallery» звезда снята флагом `favoriteDisabled`. */
export const FAVORITES_STORY_ITEMS_GALLERY_DISABLED: readonly IRtSideMenu.Item[] = mapContent(
    FAVORITES_STORY_ITEMS,
    (sub: IRtSideMenu.Item): IRtSideMenu.Item => (sub.id === 102 ? { ...sub, favoriteDisabled: true } : sub)
);

/** Длинные подписи двух разделов «Content»: по ним видно, где подпись обрезается многоточием. */
const LONG_TITLES: Readonly<Record<number, string>> = {
    3: 'Learn — guides, tutorials and onboarding',
    5: 'Press release and media kit for partners',
};

export const FAVORITES_STORY_ITEMS_LONG: readonly IRtSideMenu.Item[] = mapContent(
    FAVORITES_STORY_ITEMS_GALLERY_DISABLED,
    (sub: IRtSideMenu.Item): IRtSideMenu.Item => (LONG_TITLES[Number(sub.id)] ? { ...sub, name: LONG_TITLES[Number(sub.id)] } : sub)
);

/** Избранное витрины при первом подъёме: разделы обоих пунктов, в том числе лежащие в папках. */
export const FAVORITES_STORY_SEEDED_IDS: readonly IRtSideMenu.FavoriteId[] = [2, 7, 9, 27, 31, 5, 103, 104];

/** Открыто на «Sidebar» во вложенной папке «Content»: папки раскрыты, блок и звёзды видны. */
export const FAVORITES_STORY_ACTIVE: ReadonlyArray<IRtSideMenu.Item['id']> = [1, 100, 101, 9];

/** Меню витрины с избранным: номер меню и свёрнут ли в нём блок раздела «Content». */
export interface ISideMenuFavoritesStoryMenu {
    readonly id: string;
    readonly collapsed?: boolean;
    /** Чем заполнить пустой список; без него — разделы обоих пунктов. */
    readonly favorites?: readonly IRtSideMenu.FavoriteId[];
}

/**
 * Настройки меню витрины и заполнение при подъёме. Пустой список избранного каждого меню получает
 * разделы из обоих пунктов, в том числе лежащие в папках, — иначе кадр показывал бы подменю без
 * блока. Свёрнутость ставится, только пока её не выбрал человек: выбранное переживает перезагрузку.
 */
export function sideMenuFavoritesStoryProviders(
    config: IRtSideMenuSettingsConfig,
    menus: readonly ISideMenuFavoritesStoryMenu[]
): Array<Provider | EnvironmentProviders> {
    return [
        provideRtSideMenuSettings(config),
        provideAppInitializer((): void => {
            const settings: RtSideMenuSettingsService = inject(RtSideMenuSettingsService);

            for (const menu of menus) {
                if (!settings.favoriteIds(menu.id)().length) {
                    settings.setFavorites(menu.id, menu.favorites ?? FAVORITES_STORY_SEEDED_IDS);
                }

                if (menu.collapsed && settings.settings(menu.id)().favoritesCollapsed === undefined) {
                    settings.setFavoritesCollapsed(menu.id, 1, true);
                }
            }
        }),
    ];
}

/** Номера меню ячеек избранного в матрице меню: раскрытый блок и свёрнутый. */
export const SIDE_MENU_MATRIX_FAVORITES_OPEN: string = 'favorites-matrix-open';
export const SIDE_MENU_MATRIX_FAVORITES_COLLAPSED: string = 'favorites-matrix-collapsed';
/** Три строки блока в ячейке матрицы: под ними видны черта и список раздела. */
export const SIDE_MENU_MATRIX_FAVORITES: readonly IRtSideMenu.FavoriteId[] = [2, 5, 103];
