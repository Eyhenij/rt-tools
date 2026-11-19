import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { TABS_SHEET_MENU_TAB, TestRtTabsSheetComponent } from './component/test-tabs-sheet.component';

/**
 * Служба брейкпоинтов, всегда отвечающая «узкий экран». Шторка нужна узкому окну, а окно до `play`
 * историей не задать. Поэтому подменяется источник ответа: «узкий» с первой отрисовки.
 */
const NARROW_ANSWERS: Pick<BreakpointsService, 'mobile' | 'tablet' | 'desktop' | 'narrow' | 'viewportNarrow' | 'phone'> = {
    mobile: signal(true),
    tablet: signal(false),
    desktop: signal(false),
    narrow: signal(true),
    viewportNarrow: signal(true),
    phone: signal(true),
};

const NARROW_BREAKPOINTS: BreakpointsService = NARROW_ANSWERS as BreakpointsService;

/** Окно телефона из эскизов `Телефон · Tabs, «Ещё»` 8292:1058 и `Телефон · Tabs, меню вкладки` 8292:1122. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/** Сколько ждать после шрифтов, пока полоса измерит ряд и решит, что уходит в «Ещё», миллисекунды. */
const ROW_SETTLE_MS: number = 150;

/**
 * Вкладки на узком экране: панель «Ещё» и меню вкладки открываются в нижней шторке. Шторку открывает
 * `play`, она стоит в оверлее, поэтому кадр снимает всю страницу.
 */
export default {
    title: 'Molecules/Navigation/TabsSheet',
    component: TestRtTabsSheetComponent,
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTabsSheetComponent>;

type TStory = StoryObj<TestRtTabsSheetComponent>;

/** Узкий экран: вкладки, которым не хватило 343, — в шторке «Ещё». Нажатием на «Ещё». */
export const MoreSheet: TStory = {
    args: { part: 'more', sheet: true },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-sheet', viewport: PHONE_WINDOW } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: '[qa-dataid="tabs-more"]', wait: ROW_SETTLE_MS });
    },
};

/** Узкий экран: меню вкладки в шторке с подписью вкладки в заголовке. Долгое нажатие шлёт `contextmenu`. */
export const TabMenuSheet: TStory = {
    args: { part: 'menu', sheet: true },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-sheet', viewport: PHONE_WINDOW } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await document.fonts.ready;
        await new Promise<void>((resolve: () => void): void => {
            setTimeout((): void => resolve(), ROW_SETTLE_MS);
        });
        const tab: Element | null = canvasElement.querySelector(`[data-tabid="${TABS_SHEET_MENU_TAB}"]`);
        tab?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 30 }));
        await new Promise<void>((resolve: () => void): void => {
            setTimeout((): void => resolve(), ROW_SETTLE_MS);
        });
    },
};

/** Узкий экран с `[sheet]="false"`: шторки нет, «Ещё» раскрывается рядом с полосой. */
export const SheetOff: TStory = {
    args: { part: 'more', sheet: false },
    parameters: { snapshot: { fullPage: true, overlay: '[qa-dataid="tabs-more-menu"]', viewport: PHONE_WINDOW } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: '[qa-dataid="tabs-more"]', wait: ROW_SETTLE_MS });
    },
};
