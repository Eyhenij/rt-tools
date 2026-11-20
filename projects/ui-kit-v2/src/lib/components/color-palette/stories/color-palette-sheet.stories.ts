import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { TestRtColorPaletteSheetComponent } from './component/test-color-palette-sheet.component';

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

/** Окно телефона из эскиза `Телефон · Color Palette`. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/** Панель открывает кнопка «Свой цвет», а не образец: образец стоит в рамке первой кнопкой и просто выбрал бы цвет. */
const CUSTOM_BUTTON: string = '[qa-dataid="color-palette-custom"]';

/**
 * Палитра на узком экране. Заголовок шторки — подпись «Свой цвет». Панель выбора своего цвета
 * открывает `play` щелчком по кнопке, и она стоит в оверлее, поэтому кадр снимает всю страницу.
 */
export default {
    title: 'Molecules/Forms/ColorPaletteSheet',
    component: TestRtColorPaletteSheetComponent,
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtColorPaletteSheetComponent>;

type TStory = StoryObj<TestRtColorPaletteSheetComponent>;

async function open({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement, { within: CUSTOM_BUTTON });
}

/** Узкий экран: выбор своего цвета в нижней шторке с заголовком «Свой цвет». */
export const Sheet: TStory = {
    args: { sheet: true },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-sheet .rt-bottom-sheet--open', viewport: PHONE_WINDOW } },
    play: open,
};

/** Узкий экран с `[sheet]="false"`: шторки нет, выбор цвета стоит рядом с кнопкой. */
export const SheetOff: TStory = {
    args: { sheet: false },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-panel', viewport: PHONE_WINDOW } },
    play: open,
};
