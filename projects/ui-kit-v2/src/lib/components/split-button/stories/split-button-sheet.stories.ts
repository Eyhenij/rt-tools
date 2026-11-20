import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { TestRtSplitButtonSheetComponent } from './component/test-split-button-sheet.component';

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

/** Окно телефона из эскиза `Телефон · Split Button`. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/** Меню открывает каретка, а не лицо: лицо стоит в рамке первой кнопкой и запускало бы основное действие. */
const CARET: string = '[qa-dataid="split-button-toggle"]';

/**
 * Кнопка с раздельным действием на узком экране. Заголовок шторки — подпись кнопки («Отправить»).
 * Меню открывает `play` щелчком по каретке, и оно стоит в оверлее, поэтому кадр снимает всю страницу.
 */
export default {
    title: 'Molecules/Forms/SplitButtonSheet',
    component: TestRtSplitButtonSheetComponent,
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSplitButtonSheetComponent>;

type TStory = StoryObj<TestRtSplitButtonSheetComponent>;

async function open({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement, { within: CARET });
}

/** Узкий экран: меню в нижней шторке с заголовком «Отправить». */
export const Sheet: TStory = {
    args: { sheet: true },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-sheet .rt-bottom-sheet--open', viewport: PHONE_WINDOW } },
    play: open,
};

/** Узкий экран с `[sheet]="false"`: шторки нет, меню стоит под кнопкой. */
export const SheetOff: TStory = {
    args: { sheet: false },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-panel', viewport: PHONE_WINDOW } },
    play: open,
};
