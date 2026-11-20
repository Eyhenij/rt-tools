import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { TestRtMenuSheetComponent } from './component/test-menu-sheet.component';

/**
 * Служба брейкпоинтов, всегда отвечающая «узкий экран». Шторка нужна узкому окну, а окно историей
 * не задать; узел, который служба рисует после смены окна, не получил бы состояния витрины. Поэтому
 * подменяется источник ответа: «узкий» с первой отрисовки.
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

/** Окно телефона из эскиза `Телефон · Menu`. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/**
 * Меню действий на узком экране. Заголовок шторки — подпись кнопки меню («Действия с записью»).
 * Шторку открывает `play`, и она стоит в оверлее, поэтому кадр снимает всю страницу.
 */
export default {
    title: 'Molecules/Navigation/MenuSheet',
    component: TestRtMenuSheetComponent,
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMenuSheetComponent>;

type TStory = StoryObj<TestRtMenuSheetComponent>;

async function open({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement);
}

/** Узкий экран: пункты в нижней шторке с заголовком «Действия с записью». */
export const Sheet: TStory = {
    args: { sheet: true },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-sheet .rt-bottom-sheet--open', viewport: PHONE_WINDOW } },
    play: open,
};

/** Узкий экран с `[sheet]="false"`: шторки нет, пункты стоят рядом с кнопкой. */
export const SheetOff: TStory = {
    args: { sheet: false },
    parameters: { snapshot: { fullPage: true, overlay: '[qa-dataid="menu-panel"]', viewport: PHONE_WINDOW } },
    play: open,
};
