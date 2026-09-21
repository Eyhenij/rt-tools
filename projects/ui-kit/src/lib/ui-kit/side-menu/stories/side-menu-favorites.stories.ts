import { inject, provideAppInitializer } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { provideRtStorage } from '@rt-tools/core';
import { provideRtuiFavorites, RtuiFavoritesService } from '../favorites/rtui-favorites.service';
import { ISideMenu } from '../side-menu.types';
import { MENU_ITEMS, TestSideMenuWrapperComponent } from './component/test-side-menu-wrapper.component';

/**
 * Избранное бокового меню: звёзды у разделов и блок вверху подменю.
 *
 * Избранное включено у двух пунктов полосы — «Content» и «Collections»; у «Test» оно выключено, как у
 * всякого пункта по умолчанию, и звёзд там нет. Подписи — английские подписи кита по умолчанию.
 *
 * Список живёт в настоящем хранилище браузера под своим ключом витрины: отмеченное, переставленное и
 * перезагруженное здесь же проверяется глазами. Пустой список при подъёме заполняется тремя разделами
 * из двух пунктов полосы — иначе кадр показывал бы подменю без блока, и снимок не видел бы главного.
 */
const FAVORITE_SECTIONS: ReadonlyArray<ISideMenu.Item['id']> = [1, 19];
const FAVORITES_MENU: ISideMenu.Item[] = MENU_ITEMS.map((item: ISideMenu.Item): ISideMenu.Item =>
    FAVORITE_SECTIONS.includes(item.id) ? { ...item, favorites: true } : item
);
const SHOWCASE_KEY: string = 'rtui-showcase-side-menu-favorites';
const SEEDED_IDS: number[] = [20, 2, 5];

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

/** Закреплённое подменю «Content»: блок из его разделов в избранном, звёзды у строк списка. */
export const SubMenuFavorites: TStory = {
    args: {
        menuItems: FAVORITES_MENU,
        activeMenuIds: [1],
        subMenuMode: 'pinned',
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

/** Узкий экран: тот же блок под полем поиска, контурные звёзды видны без наведения. */
export const SubMenuFavoritesMobile: TStory = {
    globals: { viewport: { value: 'narrow' } },
    args: {
        menuItems: FAVORITES_MENU,
        activeMenuIds: [1],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};
