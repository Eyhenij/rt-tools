import { inject, provideAppInitializer } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { provideRtStorage } from '@rt-tools/core';
import { provideRtuiFavorites, RtuiFavoritesService } from '../favorites/rtui-favorites.service';
import { ISideMenu } from '../side-menu.types';
import { MENU_ITEMS, TestSideMenuWrapperComponent } from './component/test-side-menu-wrapper.component';

/**
 * Избранное бокового меню: звёзды у разделов и блок вверху подменю.
 *
 * Избранное включено у двух пунктов полосы — «Content» и «Test long name»; у «Collections» оно
 * выключено, как у всякого пункта по умолчанию, и звёзд там нет. Подписи — английские подписи кита по
 * умолчанию.
 *
 * В «Content» разделы разложены по двум вложенным папкам: звезда стоит у пунктов внутри папок и не
 * стоит у самих папок. В «Test long name» — три уровня папок, длинные подписи и кнопки пунктов: там
 * видно, как звезда уживается с дополнительной кнопкой и с переносом подписи.
 *
 * Список живёт в настоящем хранилище браузера под своим ключом витрины: отмеченное, переставленное и
 * перезагруженное здесь же проверяется глазами. Пустой список при подъёме заполняется разделами из
 * обоих пунктов, в том числе лежащими в папках, — иначе кадр показывал бы подменю без блока.
 */
const FAVORITE_SECTIONS: ReadonlyArray<ISideMenu.Item['id']> = [1, 24];

/** «Content» с папками: разделы макетов и навигации лежат во вложенных папках. */
const CONTENT_WITH_FOLDERS: ISideMenu.Item[] = [
    { id: 2, name: 'News', link: '/content/news' },
    { id: 3, name: 'Learn', link: '/content/learn' },
    { id: 4, name: 'Review', link: '/content/review' },
    { id: 5, name: 'Press release', link: '/content/press-release' },
    {
        id: 100,
        icon: 'folder',
        name: 'Layouts',
        submenu: [
            { id: 6, name: 'L1', link: '/content/l1' },
            { id: 7, name: 'L2', link: '/content/l2' },
            { id: 8, name: 'L3', link: '/content/l3' },
            {
                id: 101,
                icon: 'folder',
                name: 'Navigation',
                submenu: [
                    { id: 9, name: 'Sidebar', link: '/content/sidebar' },
                    { id: 10, name: 'Mega Menu', link: '/content/mega-menu' },
                ],
            },
        ],
    },
    { id: 11, name: 'Home page', link: '/content/home-page' },
];

const FAVORITES_MENU: ISideMenu.Item[] = MENU_ITEMS.map((item: ISideMenu.Item): ISideMenu.Item => {
    if (!FAVORITE_SECTIONS.includes(item.id)) {
        return item;
    }

    return item.id === 1 ? { ...item, favorites: true, submenu: CONTENT_WITH_FOLDERS } : { ...item, favorites: true };
});
const SHOWCASE_KEY: string = 'rtui-showcase-side-menu-favorites';
const SEEDED_IDS: number[] = [2, 7, 9, 27, 31, 5];

export default {
    title: 'Components/SideMenu/Favorites',
    component: TestSideMenuWrapperComponent,
    decorators: [
        applicationConfig({
            providers: [
                provideRtStorage(),
                provideRtuiFavorites({ storageKey: SHOWCASE_KEY }),
                provideAppInitializer((): void => {
                    const favorites: RtuiFavoritesService = inject(RtuiFavoritesService);

                    if (!favorites.ids().length) {
                        favorites.set(SEEDED_IDS);
                    }
                }),
            ],
        }),
    ],
} as Meta<TestSideMenuWrapperComponent>;

type TStory = StoryObj<TestSideMenuWrapperComponent>;

/** Закреплённое подменю «Content», открытое на «Sidebar» во вложенной папке: папки раскрыты, блок и звёзды видны. */
export const SubMenuFavorites: TStory = {
    args: {
        menuItems: FAVORITES_MENU,
        activeMenuIds: [1, 100, 101, 9],
        subMenuMode: 'pinned',
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

/** Узкий экран: тот же блок под полем поиска, полые звёзды и кнопки «убрать» видны без наведения. */
export const SubMenuFavoritesMobile: TStory = {
    globals: { viewport: { value: 'narrow' } },
    args: {
        menuItems: FAVORITES_MENU,
        activeMenuIds: [1, 100, 101, 9],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};
