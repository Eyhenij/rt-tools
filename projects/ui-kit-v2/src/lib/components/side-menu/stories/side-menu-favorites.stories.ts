import { applicationConfig, Args, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { IStorySnapshotParameters, STORY_PHONE_VIEWPORT } from '../../../../showcase/story-snapshot';
import { IRtSideMenuSettingsConfig, RT_SIDE_MENU_SETTINGS_CONFIG } from '../rt-side-menu-settings.service';
import {
    FAVORITES_STORY_ACTIVE,
    FAVORITES_STORY_ITEMS,
    FAVORITES_STORY_ITEMS_GALLERY_DISABLED,
    FAVORITES_STORY_ITEMS_LONG,
    sideMenuFavoritesStoryProviders,
} from './component/side-menu-favorites-story-data';
import { TestRtSideMenuMobileComponent } from './component/test-side-menu-mobile.component';
import { TestRtSideMenuComponent } from './component/test-side-menu.component';
import { openMobileSection } from './side-menu.play';

/**
 * Избранное бокового меню — по истории на каждую историю избранного первого кита, под теми же
 * именами и на тех же пунктах: звёзды у разделов, блок вверху подменю, сворачивание, число строк,
 * перетаскивание за ручку и стрелками. Меню живое: звезда ставит и снимает, «убрать» убирает, строки
 * тянутся, заголовок сворачивает блок.
 *
 * Список живёт в настоящем хранилище браузера под своим ключом витрины и номером меню `favorites-showcase`:
 * отмеченное и переставленное здесь переживает перезагрузку. Пустой список при подъёме заполняется
 * разделами из обоих пунктов, в том числе лежащими в папках, — иначе кадр показывал бы подменю без
 * блока.
 *
 * Строки под указателем снимаются, как у первого кита, настоящим наведением: узлы называет параметр
 * съёмки `snapshot.hover`.
 *
 * Пар наборов здесь нет: истории повторяют страницы первого кита во весь экран, и вторая половина
 * раздвоила бы и страницу, и наводимые узлы. Избранное в обоих наборах показывает история
 * `Favorites` матрицы меню.
 */
const SHOWCASE_KEY: string = 'rt-showcase-side-menu-favorites';
/** Свёрнутое живёт под своим ключом: свёрнутое здесь не сворачивает блок соседних историй. */
const COLLAPSED_KEY: string = 'rt-showcase-side-menu-favorites-collapsed';
const SHOWCASE_MENU_ID: string = 'favorites-showcase';
const RADIO: string = 'inline-radio';

export default {
    title: 'Organisms/Navigation/SideMenu/Favorites',
    component: TestRtSideMenuComponent,
    decorators: [
        applicationConfig({ providers: sideMenuFavoritesStoryProviders({ storageKey: SHOWCASE_KEY }, [{ id: SHOWCASE_MENU_ID }]) }),
    ],
    parameters: { layout: 'fullscreen', snapshot: { fullPage: true } },
    argTypes: {
        mode: { control: RADIO, options: ['hover', 'pinned'] },
        favoritesCount: { control: RADIO, options: ['always', 'collapsed', 'never'] },
        favoriteActionsReserve: { control: RADIO, options: ['always', 'none'] },
    },
} as Meta<TestRtSideMenuComponent>;

type TStory = StoryObj<TestRtSideMenuComponent>;

const PINNED_ARGS: NonNullable<TStory['args']> = {
    items: FAVORITES_STORY_ITEMS,
    menuId: SHOWCASE_MENU_ID,
    activeIds: FAVORITES_STORY_ACTIVE,
    mode: 'pinned',
};

/** Меню телефона: та же история в окне телефона, как у первого кита, раздел открыт нажатием. */
const MOBILE_IMPORTS: ReturnType<typeof moduleMetadata> = moduleMetadata({ imports: [TestRtSideMenuMobileComponent] });
const MOBILE: Pick<TStory, 'decorators' | 'render' | 'globals'> = {
    globals: { viewport: { value: 'narrow' } },
    decorators: [MOBILE_IMPORTS],
    render: (args: Args): { props: Args; template: string } => ({
        props: args,
        template: '<app-side-menu-mobile [items]="items" [menuId]="menuId" [activeIds]="activeIds" />',
    }),
};

const FIRST_ROW: string = '.rt-side-menu-favorites__row';

/** Кадр целой страницы с указателем на названных узлах, по порядку. */
function hovered(...hover: string[]): { snapshot: IStorySnapshotParameters } {
    return { snapshot: { fullPage: true, hover } };
}

/** То же в окне телефона. */
function hoveredOnPhone(...hover: string[]): { snapshot: IStorySnapshotParameters } {
    return { snapshot: { hover, fullPage: true, viewport: STORY_PHONE_VIEWPORT } };
}

/** Закреплённое подменю «Content», открытое на «Sidebar» во вложенной папке: папки раскрыты, блок и звёзды видны. */
export const SubMenuFavorites: TStory = { args: PINNED_ARGS };

/** Узкое окно: тот же блок под полем поиска; указатель на первой строке блока — кнопки встали. */
export const SubMenuFavoritesMobile: TStory = {
    ...MOBILE,
    args: PINNED_ARGS,
    parameters: hoveredOnPhone(FIRST_ROW),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => openMobileSection(canvasElement),
};

/** Значки из настроек провайдера: крестик вместо корзины и точки вместо стрелки у ручки. */
const CUSTOM_ICONS: IRtSideMenuSettingsConfig = { storageKey: SHOWCASE_KEY, icons: { remove: 'close', drag: 'ellipsis-v' } };

export const SubMenuFavoritesCustomIcons: TStory = {
    ...SubMenuFavoritesMobile,
    decorators: [MOBILE_IMPORTS, applicationConfig({ providers: [{ provide: RT_SIDE_MENU_SETTINGS_CONFIG, useValue: CUSTOM_ICONS }] })],
};

/**
 * Указатель на кнопке «убрать» первой строки: корзина красная. Без наведения на строку у кнопки
 * нет ширины, поэтому указатель наводится сначала на строку, затем на кнопку.
 */
export const SubMenuFavoritesRemoveHover: TStory = {
    args: PINNED_ARGS,
    parameters: hovered(FIRST_ROW, `${FIRST_ROW} [qa-dataid="side-menu-favorite-remove"]`),
};

/** Узкое окно, указатель на строке «Gallery»: звезды у неё нет — снята флагом `favoriteDisabled`, остался «+». */
export const SubMenuFavoritesDisabledStar: TStory = {
    ...MOBILE,
    args: { ...PINNED_ARGS, items: FAVORITES_STORY_ITEMS_GALLERY_DISABLED },
    parameters: hoveredOnPhone('.rt-side-menu-sub-item__row[id="102"]'),
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => openMobileSection(canvasElement),
};

/** Свёрнутый блок «Content»: заголовок с числом строк, шевроном вниз и чертой под ним. */
export const SubMenuFavoritesCollapsed: TStory = {
    args: PINNED_ARGS,
    decorators: [
        applicationConfig({
            providers: sideMenuFavoritesStoryProviders({ storageKey: COLLAPSED_KEY }, [{ id: SHOWCASE_MENU_ID, collapsed: true }]),
        }),
    ],
};

/** Развёрнутый блок с `favoritesCount="always"`: число строк стоит в заголовке и у развёрнутого блока. */
export const SubMenuFavoritesCountAlways: TStory = { args: { ...PINNED_ARGS, favoritesCount: 'always' } };

/** Свёрнутый блок с `favoritesCount="never"`: заголовок без числа строк. */
export const SubMenuFavoritesCollapsedNoCount: TStory = {
    ...SubMenuFavoritesCollapsed,
    args: { ...PINNED_ARGS, favoritesCount: 'never' },
};

/**
 * Длинные подписи в меню по умолчанию: в покое подпись идёт до правого края или до «+» — полые
 * звёзды, «убрать» и ручки ширины не занимают. У «Gallery» звезда снята флагом.
 */
export const SubMenuFavoritesLongTitles: TStory = { args: { ...PINNED_ARGS, items: FAVORITES_STORY_ITEMS_LONG } };

/** То же меню, указатель на длинной строке блока: «убрать» и ручка встали на место, подпись сжалась. */
export const SubMenuFavoritesLongTitlesHover: TStory = {
    ...SubMenuFavoritesLongTitles,
    parameters: hovered(`${FIRST_ROW}[data-id="5"]`),
};

/** Те же подписи с `favoriteActionsReserve="always"`: скрытые кнопки держат место и в покое. */
export const SubMenuFavoritesReserveAlways: TStory = {
    ...SubMenuFavoritesLongTitles,
    args: { ...SubMenuFavoritesLongTitles.args, favoriteActionsReserve: 'always' },
};
