import { inject, provideAppInitializer } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { provideRtStorage } from '@rt-tools/core';
import {
    IRtuiSideMenuSettingsConfig,
    provideRtuiSideMenuSettings,
    RTUI_SIDE_MENU_SETTINGS_CONFIG,
    RtuiSideMenuSettingsService,
} from '../settings/rtui-side-menu-settings.service';
import { ISideMenu } from '../side-menu.types';
import { MENU_ITEMS, TestSideMenuWrapperComponent } from './component/test-side-menu-wrapper.component';
import { waitFor } from './side-menu.wait';

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
 * Список живёт в настоящем хранилище браузера под своим ключом витрины, в объекте настроек под
 * номером меню `showcase`: отмеченное, переставленное и перезагруженное здесь же проверяется глазами. Пустой список при подъёме заполняется разделами из
 * обоих пунктов, в том числе лежащими в папках, — иначе кадр показывал бы подменю без блока.
 */
const FAVORITE_SECTIONS: ReadonlyArray<ISideMenu.Item['id']> = [1, 24];

/**
 * «Content» с папками: разделы макетов и навигации лежат во вложенных папках. Первый пункт — корень
 * раздела, как «Gallery» у потребителя; у него и у части разделов кнопка «+» создания записи, как у
 * пунктов потребителя: видно, как «+» уживается со звездой, а в блоке — с «убрать» и ручкой. Два
 * раздела с длинной подписью, с «+» и без, показывают многоточие и в списке, и в блоке.
 */
const CONTENT_WITH_FOLDERS: ISideMenu.Item[] = [
    { id: 102, icon: 'photo_library', name: 'Gallery', link: '/content', iconButton: { icon: 'add', data: '/content' } },
    { id: 2, name: 'News', link: '/content/news', iconButton: { icon: 'add', data: '/content/news' } },
    {
        id: 103,
        name: 'Quarterly reports for regional partners and distributors',
        link: '/content/quarterly-reports',
        iconButton: { icon: 'add', data: '/content/quarterly-reports' },
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
            { id: 7, name: 'L2', link: '/content/l2', iconButton: { icon: 'add', data: '/content/l2' } },
            { id: 8, name: 'L3', link: '/content/l3' },
            {
                id: 101,
                icon: 'folder',
                name: 'Navigation',
                submenu: [
                    { id: 9, name: 'Sidebar', link: '/content/sidebar', iconButton: { icon: 'add', data: '/content/sidebar' } },
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
const SHOWCASE_KEY: string = 'rtui-showcase-side-menu';
/** Номер меню витрины: под ним в объекте настроек лежит его избранное. */
const SHOWCASE_MENU_ID: string = 'showcase';
const SEEDED_IDS: number[] = [2, 7, 9, 27, 31, 5, 103, 104];

export default {
    title: 'Components/SideMenu/Favorites',
    component: TestSideMenuWrapperComponent,
    decorators: [
        applicationConfig({
            providers: [
                provideRtStorage(),
                provideRtuiSideMenuSettings({ storageKey: SHOWCASE_KEY }),
                // Значки — шрифтом Material Symbols, как у потребителей: в старом Material Icons нет
                // значка ручки и оси заливки звезды.
                provideAppInitializer((): void => {
                    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
                }),
                // Пустые настройки при подъёме заполняются: избранным и закреплённой модой. Выбор,
                // сделанный здесь, — мода, ширина, избранное — переживает перезагрузку.
                provideAppInitializer((): void => {
                    const settings: RtuiSideMenuSettingsService = inject(RtuiSideMenuSettingsService);

                    if (!settings.ids(SHOWCASE_MENU_ID)().length) {
                        settings.set(SHOWCASE_MENU_ID, SEEDED_IDS);
                    }

                    if (settings.settings(SHOWCASE_MENU_ID)().subMenuMode === undefined) {
                        settings.setSubMenuMode(SHOWCASE_MENU_ID, 'pinned');
                    }
                }),
            ],
        }),
    ],
} as Meta<TestSideMenuWrapperComponent>;

type TStory = StoryObj<TestSideMenuWrapperComponent>;

/**
 * Узкий экран открывает раздел нажатием: без него в кадре одна полоса. Ждётся кнопка «убрать» в
 * блоке — знак того, что подменю раздела с избранным открыто.
 */
async function openNarrowFavorites({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    const item: HTMLElement | null = await waitFor<HTMLElement>((): HTMLElement | null =>
        canvasElement.querySelector('mat-list-item.rtui-mobile-side-menu-item')
    );

    if (item === null) {
        throw new Error('Пункт узкого меню не появился: нажимать нечего');
    }

    item.click();

    if (
        (await waitFor<HTMLElement>((): HTMLElement | null => canvasElement.querySelector('[qa-dataid="side-menu-favorite-remove"]'))) ===
        null
    ) {
        throw new Error('Блок избранного не открылся: кнопки «убрать» нет');
    }
}

/** Закреплённое подменю «Content», открытое на «Sidebar» во вложенной папке: папки раскрыты, блок и звёзды видны. */
export const SubMenuFavorites: TStory = {
    args: {
        menuItems: FAVORITES_MENU,
        menuId: SHOWCASE_MENU_ID,
        activeMenuIds: [1, 100, 101, 9],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

/** Узкое окно: тот же блок под полем поиска; кнопки строки ждут наведения, на телефоне видны всегда. */
export const SubMenuFavoritesMobile: TStory = {
    globals: { viewport: { value: 'narrow' } },
    // Снимок берёт узкое окно сам: витринный размер кадр не меняет. Кнопки видны всегда только без
    // мыши, а браузер снимка наводится, и подменить ему признак `hover` не удалось ни подменой
    // медиазапроса, ни касанием вместо мыши. Поэтому кадр показывает узкое окно с мышью: кнопки
    // первой строки блока — под наведением. Телефон проверяется на телефоне.
    parameters: { snapshotViewport: { width: 360, height: 780 }, snapshotHover: '[qa-dataid="side-menu-favorite-row"]' },
    play: openNarrowFavorites,
    args: {
        menuItems: FAVORITES_MENU,
        menuId: SHOWCASE_MENU_ID,
        activeMenuIds: [1, 100, 101, 9],
        isSubMenuXScrollEnabled: true,
        isMainMenuIconsOutlined: false,
        isSubMenuIconsOutlined: false,
        isSubMenuButtonIconsOutlined: false,
        isSubMenuTooltipsShown: true,
    },
};

/** Значки, заданные настройками: крестик вместо корзины и ручка без поворота; подсказки остаются подписями. */
const CUSTOM_ICONS: IRtuiSideMenuSettingsConfig = {
    storageKey: SHOWCASE_KEY,
    icons: { remove: { glyph: 'close' }, drag: { glyph: 'drag_indicator', rotate: 0 } },
};

/** Узкое окно со значками из настроек: крестик и ручка без поворота у строки под наведением. */
export const SubMenuFavoritesCustomIcons: TStory = {
    ...SubMenuFavoritesMobile,
    decorators: [applicationConfig({ providers: [{ provide: RTUI_SIDE_MENU_SETTINGS_CONFIG, useValue: CUSTOM_ICONS }] })],
};

/**
 * Указатель на кнопке «убрать»: корзина красная, цвет приложение задаёт свойством
 * `--rt-side-menu-favorite-remove-hover-color`. Без наведения на строку у кнопки нет ширины, поэтому
 * указатель наводится сначала на строку, затем на кнопку.
 */
export const SubMenuFavoritesRemoveHover: TStory = {
    ...SubMenuFavorites,
    parameters: { snapshotHover: ['[qa-dataid="side-menu-favorite-row"]', '[qa-dataid="side-menu-favorite-remove"]'] },
};

/**
 * Тот же «Content», где у корня раздела «Gallery» звезда снята флагом `favoriteDisabled`: страница
 * раздела — не содержимое, выбирать её незачем.
 */
const FAVORITES_MENU_GALLERY_DISABLED: ISideMenu.Item[] = FAVORITES_MENU.map((item: ISideMenu.Item): ISideMenu.Item =>
    item.id === 1
        ? {
              ...item,
              submenu: (item.submenu ?? []).map((sub: ISideMenu.Item): ISideMenu.Item =>
                  sub.id === 102 ? { ...sub, favoriteDisabled: true } : sub
              ),
          }
        : item
);

/** Узкое окно, указатель на строке «Gallery»: звезда у неё не появляется, остаётся только «+». */
export const SubMenuFavoritesDisabledStar: TStory = {
    ...SubMenuFavoritesMobile,
    parameters: { ...SubMenuFavoritesMobile.parameters, snapshotHover: 'mat-list-item[id="102"]' },
    args: { ...SubMenuFavoritesMobile.args, menuItems: FAVORITES_MENU_GALLERY_DISABLED },
};

/**
 * Свёрнутый блок «Content»: заголовок с числом строк, шевроном вниз и чертой под ним. Настройки
 * лежат под своим ключом витрины — свёрнутое здесь не сворачивает блок соседних историй.
 */
const COLLAPSED_KEY: string = 'rtui-showcase-side-menu-collapsed';

export const SubMenuFavoritesCollapsed: TStory = {
    ...SubMenuFavorites,
    decorators: [
        applicationConfig({
            providers: [
                { provide: RTUI_SIDE_MENU_SETTINGS_CONFIG, useValue: { storageKey: COLLAPSED_KEY } },
                provideAppInitializer((): void => {
                    const settings: RtuiSideMenuSettingsService = inject(RtuiSideMenuSettingsService);

                    if (!settings.settings(SHOWCASE_MENU_ID)().favoritesCollapsed) {
                        settings.setFavoritesCollapsed(SHOWCASE_MENU_ID, 1, true);
                    }
                }),
            ],
        }),
    ],
};

/** Развёрнутый блок с `favoritesCount="always"`: число строк стоит в заголовке и у развёрнутого блока. */
export const SubMenuFavoritesCountAlways: TStory = {
    ...SubMenuFavorites,
    args: { ...SubMenuFavorites.args, favoritesCount: 'always' },
};

/** Свёрнутый блок с `favoritesCount="never"`: заголовок без числа строк. */
export const SubMenuFavoritesCollapsedNoCount: TStory = {
    ...SubMenuFavoritesCollapsed,
    args: { ...SubMenuFavoritesCollapsed.args, favoritesCount: 'never' },
};

/** Длинные подписи двух разделов «Content»: по ним видно, где подпись обрезается многоточием. */
const LONG_TITLES: Readonly<Record<number, string>> = {
    3: 'Learn — guides, tutorials and onboarding',
    5: 'Press release and media kit for partners',
};

const FAVORITES_MENU_LONG: ISideMenu.Item[] = FAVORITES_MENU_GALLERY_DISABLED.map((item: ISideMenu.Item): ISideMenu.Item =>
    item.id === 1
        ? {
              ...item,
              submenu: (item.submenu ?? []).map((sub: ISideMenu.Item): ISideMenu.Item =>
                  LONG_TITLES[Number(sub.id)] ? { ...sub, name: LONG_TITLES[Number(sub.id)] } : sub
              ),
          }
        : item
);

/**
 * Длинные подписи в меню по умолчанию: в покое подпись идёт до правого края или до «+» — полые
 * звёзды, «убрать» и ручки ширины не занимают. У «Gallery» звезда снята флагом.
 */
export const SubMenuFavoritesLongTitles: TStory = {
    ...SubMenuFavorites,
    args: { ...SubMenuFavorites.args, menuItems: FAVORITES_MENU_LONG },
};

/** То же меню, указатель на длинной строке блока: «убрать» и ручка встали на место, подпись сжалась. */
export const SubMenuFavoritesLongTitlesHover: TStory = {
    ...SubMenuFavoritesLongTitles,
    parameters: { snapshotHover: '[qa-dataid="side-menu-favorite-row"][data-id="5"]' },
};

/**
 * Те же подписи в меню с `favoriteActionsReserve="always"`: скрытые кнопки держат место и в покое,
 * и многоточие встаёт перед ними — прежний вид для приложения, которому он нужен.
 */
export const SubMenuFavoritesReserveAlways: TStory = {
    ...SubMenuFavoritesLongTitles,
    args: { ...SubMenuFavoritesLongTitles.args, favoriteActionsReserve: 'always' },
};
