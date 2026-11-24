import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { TestRtSelectSheetComponent } from './component/test-select-sheet.component';

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

/** Открытая шторка списка: по ней кадр ждёт, что список уже показан. */
const OPEN_SHEET: string = '.rt-popover-sheet .rt-bottom-sheet--open';

/** Окно телефона из эскиза `Телефон · Select`. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/**
 * Список выбора на узком экране. Заголовок шторки — подпись `rt-field`, в котором стоит выбор.
 * Список открывает `play`, и он стоит в оверлее, поэтому кадр снимает всю страницу.
 */
export default {
    title: 'Molecules/Forms/SelectSheet',
    component: TestRtSelectSheetComponent,
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSelectSheetComponent>;

type TStory = StoryObj<TestRtSelectSheetComponent>;

async function open({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> {
    await openStoryOverlay(canvasElement);
}

/** Открывает шторку и ставит фокус в её поиск: от фокуса высота шторки не меняется. */
async function openAndSearch(context: { canvasElement: HTMLElement }): Promise<void> {
    await open(context);
    document.querySelector<HTMLInputElement>('.rt-popover-sheet [qa-dataid="select-filter"] input')?.focus();
}

/**
 * Узкий экран: список в нижней шторке с заголовком «Страна». Опции стоят карточками: подпись и
 * пояснение слева, радиокнопка кита справа, выбранная отмечена, выключенная приглушена.
 */
export const Sheet: TStory = {
    args: { sheet: true },
    parameters: { snapshot: { fullPage: true, overlay: OPEN_SHEET, viewport: PHONE_WINDOW } },
    play: open,
};

/** Список с поиском: шторка открыта по высоте содержимого. */
export const SheetSearch: TStory = {
    args: { sheet: true, filter: true },
    parameters: { snapshot: { fullPage: true, overlay: OPEN_SHEET, viewport: PHONE_WINDOW } },
    play: open,
};

/**
 * Фокус в поиске: кольцо фокуса видно целиком, шторка по высоте содержимого. Во всю высоту она
 * встаёт, только пока на телефоне показана экранная клавиатура; в кадре клавиатуры нет.
 */
export const SheetSearchFocused: TStory = {
    args: { sheet: true, filter: true },
    parameters: { snapshot: { fullPage: true, overlay: OPEN_SHEET, viewport: PHONE_WINDOW } },
    play: openAndSearch,
};

/** Узкий экран с `[sheet]="false"`: шторки нет, список стоит рядом с полем. */
export const SheetOff: TStory = {
    args: { sheet: false },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-panel', viewport: PHONE_WINDOW } },
    play: open,
};
