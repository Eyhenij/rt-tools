import { inject, provideAppInitializer } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { provideRtStorage } from '@rt-tools/core';
import { provideRtuiFavorites, RtuiFavoritesService } from '../favorites/rtui-favorites.service';
import { TestSideMenuWrapperComponent } from './component/test-side-menu-wrapper.component';

/**
 * Избранное бокового меню: звёзды у разделов и блок вверху подменю.
 *
 * Список живёт в настоящем хранилище браузера под своим ключом витрины: отмеченное, переставленное и
 * перезагруженное здесь же проверяется глазами. Пустой список при подъёме заполняется тремя разделами
 * из двух пунктов полосы — иначе кадр показывал бы подменю без блока, и снимок не видел бы главного.
 */
const SHOWCASE_KEY: string = 'rtui-showcase-side-menu-favorites';
const SEEDED_IDS: number[] = [20, 2, 5];

export default {
    title: 'Components/SideMenu/Favorites',
    component: TestSideMenuWrapperComponent,
    decorators: [
        applicationConfig({
            providers: [
                provideRtStorage(),
                provideRtuiFavorites({
                    storageKey: SHOWCASE_KEY,
                    labels: { title: 'Избранное', add: 'Добавить в избранное', remove: 'Убрать из избранного' },
                }),
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

/** Закреплённое подменю «Content»: блок из разделов двух пунктов полосы, звёзды у строк списка. */
export const SubMenuFavorites: TStory = {
    args: {
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
        activeMenuIds: [1],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};
