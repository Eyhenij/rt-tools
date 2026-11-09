import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { TestRtPageHeaderVerticalComponent } from './component/test-page-header-vertical.component';

/**
 * Вертикальный вид `rt-page-header` с теми же разделами, вкладками и таблицей, что в кадрах: рейка 50
 * и панель раздела 220 поверх страницы, компактная шапка страницы, вкладки и ассистент. Телефон
 * показан окном кадра 375 × 812: порог рейки — запрос по ширине окна.
 */
export default {
    title: 'Molecules/Navigation/PageHeaderVertical',
    component: TestRtPageHeaderVerticalComponent,
    parameters: { controls: { disable: true }, layout: 'fullscreen', snapshot: { widths: [storyWidthAtMost(768)] } },
} as Meta<TestRtPageHeaderVerticalComponent>;

type TStory = StoryObj<TestRtPageHeaderVerticalComponent>;

type TPlay = (context: { canvasElement: HTMLElement }) => Promise<void>;

const LONG_TITLE: string = 'Брони по всем объектам и партнёрам';

const PHONE: { readonly viewport: { readonly value: string } } = { viewport: { value: 'phone' } };

const DARK_PHONE: { readonly viewport: { readonly value: string }; readonly theme: string } = { ...PHONE, theme: 'dark' };

const DARK: { readonly theme: string } = { theme: 'dark' };

/** Сколько вкладок в кадрах телефона с меню «Ещё». */
const PHONE_TABS: number = 10;

/** Сколько вкладок в широких кадрах, где они не встают. */
const MANY_TABS: number = 14;

/** Окно кадра, где разделы не встают в рейку. */
const SHORT_SCREEN: number = 560;

const BURGER: string = '[qa-dataid="rail-burger"]';

interface IShotSize {
    readonly width: number;
    readonly height: number;
}

interface IShot {
    readonly snapshot: { readonly fullPage?: boolean; readonly overlay?: string; readonly viewport?: IShotSize };
}

/** Окно кадра телефона. Съёмка не читает окно витрины, без размера телефон снялся бы в 1280. */
const PHONE_VIEW: IShotSize = { width: 375, height: 812 };

/** Панель открывается жестом: в общем слое перекрытий, где съёмка ищет её сама. */
const OPENED: IShot = { snapshot: { fullPage: true } };

const PHONE_SHOT: IShot = { snapshot: { viewport: PHONE_VIEW } };

const PHONE_OPENED: IShot = { snapshot: { fullPage: true, viewport: PHONE_VIEW } };

/**
 * Панель стоит вне общего слоя перекрытий: панель раздела, меню телефона, шторка и меню действий.
 * Съёмка сверяет названный узел, иначе она ждала бы панель в слое, где её нет.
 */
function openedAt(overlay: string, viewport?: IShotSize): IShot {
    return { snapshot: { fullPage: true, overlay, viewport } };
}

const PANEL: string = '[qa-dataid="rail-panel"]';

const PHONE_MENU: string = 'rt-page-phone-menu';

const TABS_MORE: string = '[qa-dataid="tabs-more"]';

function openOn(selector: string): TPlay {
    return async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: selector, wait: 200 });
        // Жест витрины оставляет кнопку в фокусе, у нажатия мышью кольца нет: кадр без кольца.
        canvasElement.ownerDocument.querySelector<HTMLElement>(`${selector}:focus`)?.blur();
    };
}

const openPanel: TPlay = async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
    await openStoryOverlay(canvasElement, { event: 'mouseenter', within: '[qa-dataid="rail-item"][data-id="finance"]', wait: 200 });
};

const openPhoneSection: TPlay = async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
    await openStoryOverlay(canvasElement, { within: BURGER, wait: 200 });
    await openStoryOverlay(canvasElement, { within: '[qa-dataid="phone-menu-row"][data-id="bookings"]', wait: 200 });
};

export const Rail: TStory = { args: { bar: true } };

export const RailDisabled: TStory = { args: { bar: true, disabledSection: true } };

export const RailShort: TStory = { args: { bar: true, manySections: true, screenHeight: SHORT_SCREEN } };

export const PanelOpen: TStory = {
    parameters: openedAt(PANEL),
    args: { bar: true, overlay: true },
    play: openPanel,
};

export const ProfileOpen: TStory = {
    parameters: OPENED,
    args: { bar: true, overlay: true },
    play: openOn('[qa-dataid="page-user"]'),
};

export const BarOneRow: TStory = { args: { bar: true } };

export const BarTwoRows: TStory = { args: { bar: true, pageTitle: LONG_TITLE, filterCount: 5 } };

export const BarMoreFilters: TStory = { args: { bar: true, pageTitle: LONG_TITLE, filterCount: 7 } };

export const Tabs: TStory = { args: { bar: true, tabs: 5 } };

/** Меню выбранной вкладки по правой кнопке. */
export const TabMenuOpen: TStory = {
    parameters: { snapshot: { fullPage: true, overlay: '[qa-dataid="tabs-context-menu"]' } },
    args: { bar: true, tabs: 5 },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await document.fonts.ready;
        const tab: Element | null = canvasElement.querySelector('[data-tabitem="tab-2"]');
        tab?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 240, clientY: 30 }));
    },
};

export const TabsMore: TStory = { args: { bar: true, tabs: MANY_TABS } };

export const TabsMoreOpen: TStory = {
    parameters: OPENED,
    args: { bar: true, tabs: MANY_TABS, overlay: true },
    play: openOn(TABS_MORE),
};

export const TabsScroll: TStory = { args: { bar: true, tabs: MANY_TABS, overflow: 'scroll' } };

export const SingleTab: TStory = { args: { bar: true, tabs: 1 } };

export const Assistant: TStory = { args: { bar: true, assistant: true } };

export const TabsAssistant: TStory = { args: { bar: true, tabs: MANY_TABS, assistant: true } };

export const TabsAssistantScroll: TStory = { args: { bar: true, tabs: MANY_TABS, assistant: true, overflow: 'scroll' } };

export const TabsAssistantMoreOpenDark: TStory = {
    globals: DARK,
    parameters: OPENED,
    args: { bar: true, tabs: MANY_TABS, assistant: true, overlay: true },
    play: openOn(TABS_MORE),
};

export const AssistantDark: TStory = { globals: DARK, args: { bar: true, assistant: true } };

export const TabsDark: TStory = { globals: DARK, args: { bar: true, tabs: 5 } };

export const FiltersApplied: TStory = { args: { bar: true, filtersActive: true } };

export const TabsPanelOpen: TStory = {
    parameters: openedAt(PANEL),
    args: { bar: true, tabs: 5, overlay: true },
    play: openPanel,
};

/** Страница на телефоне целиком: бургер открывает меню, пункты переходят, отборы и действия работают. */
export const PhonePage: TStory = { globals: PHONE, parameters: PHONE_SHOT, args: { bar: true, tabs: 5 } };

export const PhoneWithoutTabs: TStory = { globals: PHONE, parameters: PHONE_SHOT, args: { bar: true } };

export const PhoneMenu: TStory = {
    globals: PHONE,
    parameters: openedAt(PHONE_MENU, PHONE_VIEW),
    args: { bar: true, tabs: 5, overlay: true },
    play: openOn(BURGER),
};

export const PhoneMenuDisabled: TStory = {
    globals: PHONE,
    parameters: openedAt(PHONE_MENU, PHONE_VIEW),
    args: { bar: true, tabs: 5, disabledSection: true, overlay: true },
    play: openOn(BURGER),
};

/** Раздел с панелью открыт на месте списка: «Назад» и пункты с названиями групп. */
export const PhoneMenuNested: TStory = {
    globals: PHONE,
    parameters: openedAt(PHONE_MENU, PHONE_VIEW),
    args: { bar: true, tabs: 5, overlay: true },
    play: openPhoneSection,
};

export const PhoneTabsMore: TStory = {
    globals: PHONE,
    parameters: PHONE_OPENED,
    args: { bar: true, tabs: PHONE_TABS, overlay: true },
    play: openOn(TABS_MORE),
};

export const PhoneFilters: TStory = {
    globals: PHONE,
    parameters: openedAt('[qa-dataid="page-bar-sheet"]', PHONE_VIEW),
    args: { bar: true, tabs: 5, overlay: true },
    play: openOn('[qa-dataid="page-bar-filters"]'),
};

/** Меню действий и точка на кнопке отборов: отборы применены. */
export const PhoneActions: TStory = {
    globals: PHONE,
    parameters: openedAt('.rt-page-bar-menu', PHONE_VIEW),
    args: { bar: true, tabs: 5, filtersActive: true, overlay: true },
    play: openOn('[qa-dataid="page-bar-actions-menu"] button'),
};

export const PhoneAssistant: TStory = { globals: PHONE, parameters: PHONE_SHOT, args: { bar: true, tabs: 5, assistant: true } };

export const PhoneDark: TStory = { globals: DARK_PHONE, parameters: PHONE_SHOT, args: { bar: true, tabs: 5 } };
