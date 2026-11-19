import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { TestRtPageHeaderSheetComponent } from './component/test-page-header-sheet.component';

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

/** Окно телефона из эскизов `Телефон · Page Header` 8310:17232, 8310:17301, 8310:17374. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/**
 * Окно кадра «Ещё». Ряд разделов шапки прячется стилем на `@media (width <= 1080px)`, а кнопка «Ещё»
 * живёт только в этом ряду: в окне 375 её нет, и открывать нечего. Узкий ответ даёт подмена службы, а
 * ряд измеряется по ширине рамки 375 — окно шире порога.
 */
const MORE_WINDOW: { readonly width: number; readonly height: number } = { width: 1100, height: 812 };

/** Оверлей, которого ждёт снимок: нижняя шторка. */
const SHEET_OVERLAY: string = '.rt-popover-sheet';

/** Кнопка с именем пользователя: она открывает меню профиля. */
const USER_MENU_TRIGGER: string = '[qa-dataid="header-user-menu"]';

/**
 * Меню шапки страницы на узком экране: профиль, «Ещё» и панель раздела открываются в нижней шторке
 * по касанию. Шторку открывает `play`, она стоит в оверлее, поэтому кадр снимает всю страницу.
 */
export default {
    title: 'Molecules/Navigation/PageHeaderSheet',
    component: TestRtPageHeaderSheetComponent,
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtPageHeaderSheetComponent>;

type TStory = StoryObj<TestRtPageHeaderSheetComponent>;

/** Узкий экран: меню профиля в шторке с именем пользователя в заголовке. Нажатием на имя. */
export const UserMenuSheet: TStory = {
    args: { part: 'user-menu', sheet: true },
    parameters: { snapshot: { fullPage: true, overlay: SHEET_OVERLAY, viewport: PHONE_WINDOW } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: USER_MENU_TRIGGER });
    },
};

/** Узкий экран: разделы, которым не хватило ширины, — в шторке «Ещё». Нажатием на «Ещё». */
export const MoreSheet: TStory = {
    args: { part: 'more', sheet: true },
    parameters: { snapshot: { fullPage: true, overlay: SHEET_OVERLAY, viewport: MORE_WINDOW } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: '[qa-dataid="header-nav-more"]' });
    },
};

/** Узкий экран: панель раздела «Справочники» в шторке с подписью раздела в заголовке. Нажатием на раздел. */
export const SubmenuSheet: TStory = {
    args: { part: 'submenu', sheet: true },
    parameters: { snapshot: { fullPage: true, overlay: SHEET_OVERLAY, viewport: PHONE_WINDOW } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: '[qa-dataid="header-nav-trigger"]' });
    },
};

/** Узкий экран с `[sheet]="false"`: шторки нет, меню профиля стоит рядом с именем на подложке. */
export const SheetOff: TStory = {
    args: { part: 'user-menu', sheet: false },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-panel', viewport: PHONE_WINDOW } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { within: USER_MENU_TRIGGER });
    },
};
