import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { TestRtAutocompleteSheetComponent } from './component/test-autocomplete-sheet.component';

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

/** Окно телефона из эскиза `Телефон · Autocomplete`. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/**
 * Поле с подсказками на узком экране. Касание открывает шторку сразу: наверху поле поиска
 * (`autocomplete-sheet-search`), под ним подсказки. Шторку открывает `play`, и она стоит
 * в оверлее, поэтому кадр снимает всю страницу.
 */
export default {
    title: 'Molecules/Forms/AutocompleteSheet',
    component: TestRtAutocompleteSheetComponent,
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAutocompleteSheetComponent>;

type TStory = StoryObj<TestRtAutocompleteSheetComponent>;

async function open({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement, { within: 'input', wait: 200 });
}

/** Узкий экран: подсказки в нижней шторке, наверху поле поиска. */
export const Sheet: TStory = {
    args: { sheet: true },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-sheet', viewport: PHONE_WINDOW } },
    play: open,
};

/** Узкий экран с `[sheet]="false"`: шторки нет, подсказки стоят рядом с полем. */
export const SheetOff: TStory = {
    args: { sheet: false },
    parameters: { snapshot: { fullPage: true, overlay: '[qa-dataid="autocomplete-panel"]', viewport: PHONE_WINDOW } },
    play: open,
};
