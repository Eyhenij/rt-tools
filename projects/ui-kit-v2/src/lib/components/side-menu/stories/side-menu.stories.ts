import { Args, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { STORY_PHONE_VIEWPORT } from '../../../../showcase/story-snapshot';
import { SIDE_MENU_STORY_DEEP_ACTIVE } from './component/side-menu-story-data';
import { TestRtSideMenuMobileComponent } from './component/test-side-menu-mobile.component';
import { TestRtSideMenuComponent } from './component/test-side-menu.component';
import { holdBySearch, openSection, pressKey, SIDE_MENU_PANEL, typeQuery } from './side-menu.play';

/**
 * Живое меню во всю высоту окна — по истории на каждое состояние из историй бокового меню первого
 * кита, под теми же именами и на тех же пунктах, чтобы два кадра сравнивались рядом. Меню в них
 * настоящее: разделы открываются, поиск, закрепление, папки и тяга ширины отвечают.
 */
export default {
    title: 'Organisms/Navigation/SideMenu',
    component: TestRtSideMenuComponent,
    parameters: { layout: 'fullscreen', snapshot: { fullPage: true } },
    argTypes: {
        items: { control: 'object' },
        activeIds: { control: 'object' },
        mode: { control: 'inline-radio', options: ['hover', 'pinned'] },
        width: { control: { type: 'number', min: 120, max: 480, step: 16 } },
        short: { control: 'boolean' },
    },
} as Meta<TestRtSideMenuComponent>;

type TStory = StoryObj<TestRtSideMenuComponent>;

/** Подменю, открытое наведением, гаснет, когда обвязка уводит указатель: история называет панель. */
const HOVERED: { snapshot: { fullPage: boolean; overlay: string } } = { snapshot: { fullPage: true, overlay: SIDE_MENU_PANEL } };

/**
 * Меню телефона: та же история в окне телефона, как `Mobile` первого кита, — 360 на 780. Узкий экран
 * кит определяет сам, по ширине окна; в витрине окно ставит панель размеров окна.
 */
const MOBILE: Pick<TStory, 'decorators' | 'render' | 'globals' | 'parameters'> = {
    globals: { viewport: { value: 'narrow' } },
    parameters: { snapshot: { fullPage: true, viewport: STORY_PHONE_VIEWPORT } },
    decorators: [moduleMetadata({ imports: [TestRtSideMenuMobileComponent] })],
    render: (args: Args): { props: Args; template: string } => ({
        props: args,
        template: '<app-side-menu-mobile [activeIds]="activeIds" />',
    }),
};

/** Первый кит — `Default`: меню в покое, ни один раздел не открыт. */
export const Playground: TStory = {
    args: { mode: 'hover', activeIds: [], width: null, short: false },
};

export const Mobile: TStory = { ...MOBILE, args: { activeIds: [] } };

export const DefaultActiveMenu: TStory = { args: { activeIds: SIDE_MENU_STORY_DEEP_ACTIVE } };

export const MobileActiveMenu: TStory = { ...MOBILE, args: { activeIds: SIDE_MENU_STORY_DEEP_ACTIVE } };

/** Закреплённое подменю стоит открытым рядом с полосой, пока человек сам его не свернёт. */
export const SubMenuPinned: TStory = { args: { activeIds: [1], mode: 'pinned' } };

/** Поиск с совпадениями: в подменю остаются пункты, подпись которых содержит запрос. */
export const SubMenuSearchMatches: TStory = {
    args: { activeIds: [1], mode: 'pinned' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => typeQuery(canvasElement, 'l'),
};

/** Папка совпала подписью, а внутри не совпал никто: на экране одна её строка. */
export const SubMenuFolderMatchedAlone: TStory = {
    args: { activeIds: [24], mode: 'pinned' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => typeQuery(canvasElement, 'level 1'),
};

/** Подсветка клавиатуры живёт только между нажатиями клавиш — здесь она в кадре. */
export const SubMenuKeyboardHighlight: TStory = {
    args: { activeIds: [1], mode: 'pinned' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => pressKey(canvasElement, 'ArrowDown'),
};

/** Совпадений нет: вместо списка стоит строка сообщения. */
export const SubMenuSearchEmpty: TStory = {
    args: { activeIds: [1], mode: 'pinned' },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => typeQuery(canvasElement, 'no such item'),
};

/** Растянутое подменю: ширину человек тянет за край, здесь она задана доводом. */
export const SubMenuWide: TStory = { args: { activeIds: [1], mode: 'pinned', width: 360 } };

/** Незакреплённое подменю, открытое нажатием: у кнопки закрепления спокойный вид. */
export const SubMenuHovered: TStory = {
    parameters: HOVERED,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => openSection(canvasElement),
};

/** Панель подменю остаётся на месте при обходе разделов полосы. */
export const SubMenuKeepsItsPlace: TStory = {
    parameters: HOVERED,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openSection(canvasElement, 'Collections');
        await openSection(canvasElement, 'Content');
    },
};

/** Длинные подписи в узкой панели: строка не шире панели, текст уходит в многоточие. */
export const SubMenuLongTitle: TStory = { args: { activeIds: SIDE_MENU_STORY_DEEP_ACTIVE, mode: 'pinned' } };

/** Подменю, удержанное полем поиска, встаёт во всю разрешённую ширину и тянет строки за собой. */
export const SubMenuHeldBySearch: TStory = {
    parameters: HOVERED,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openSection(canvasElement);
        await holdBySearch(canvasElement);
    },
};

/** Низкий экран: полоса не влезла по высоте и говорит об этом. */
export const MenuScrollHint: TStory = { args: { short: true } };

/** Ручка тяги у закреплённого подменю. */
export const MenuResizerGrab: TStory = { args: { short: true, activeIds: [24], mode: 'pinned' } };

/** Низкий экран, подменю раскрыто до третьего уровня: узкая полоса прокрутки у обоих списков. */
export const MenuScrollbar: TStory = { args: { short: true, activeIds: SIDE_MENU_STORY_DEEP_ACTIVE, mode: 'pinned' } };
