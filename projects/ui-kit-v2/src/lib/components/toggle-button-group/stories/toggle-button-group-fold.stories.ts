import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay, STORY_TRIGGER_ATTRIBUTE } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { IRtToggleButtonGroup } from '../rt-toggle-button-group.model';
import { TestRtToggleButtonGroupFoldComponent } from './component/test-toggle-button-group-fold.component';

/**
 * Служба брейкпоинтов, всегда отвечающая «узкий экран»: свёрнутое поле открывает список шторкой,
 * а окно историей не задать. Подменяется источник ответа — «узкий» с первой отрисовки.
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

/** Окно телефона из эскизов `Телефон · Toggle Button Group`. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

const PERIODS: ReadonlyArray<IRtToggleButtonGroup.Option<string>> = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'quarter', label: 'Квартал' },
    { value: 'year', label: 'Год' },
    { value: 'custom', label: 'Свой период' },
];

const FOLDED: string = '[qa-dataid="toggle-button-group-folded"]';

/**
 * Группа кнопок на телефоне: шесть периодов в рамке 375 не помещаются и сворачиваются в поле
 * выбора, три коротких остаются кнопками. Рамка задана шириной, а не `max-width`: свёртка идёт по
 * замеру наблюдателя размера, и ширина места должна быть жёсткой.
 */
export default {
    title: 'Molecules/Forms/ToggleButtonGroupFold',
    component: TestRtToggleButtonGroupFoldComponent,
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
    parameters: {
        controls: { disable: true },
        // Рамка 375 стоит в обёртке без помощников витрины, поэтому кадр — целая страница окна телефона.
        snapshot: { fullPage: true, viewport: PHONE_WINDOW },
    },
} as Meta<TestRtToggleButtonGroupFoldComponent>;

type TStory = StoryObj<TestRtToggleButtonGroupFoldComponent>;

/** Один выбор: «Неделя» стоит в свёрнутом поле `rt-select`. */
export const FoldedOne: TStory = {
    args: { options: PERIODS, multiple: false, value: 'week' },
};

/** Множественный выбор: те же периоды в свёрнутом `rt-multiselect`, выбраны два. */
export const FoldedMany: TStory = {
    args: { options: PERIODS, multiple: true, values: ['week', 'month'] },
};

/** Три коротких значения помещаются в рамку и остаются кнопками. */
export const Fits: TStory = {
    args: { options: PERIODS.slice(0, 3), multiple: false, value: 'week' },
};

/** Свёрнутое поле открыто: список стоит в нижней шторке. */
export const FoldedOneOpen: TStory = {
    args: { options: PERIODS, multiple: false, value: 'week' },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-sheet .rt-bottom-sheet--open', viewport: PHONE_WINDOW } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        // Свёрнутое поле рисует сама группа после замера, и пометить его в разметке обёртки нечем:
        // ждём, пока оно встанет, и метим по `qa-dataid`.
        await document.fonts.ready;
        for (let attempt: number = 0; attempt < 50; attempt++) {
            const host: HTMLElement | null = canvasElement.querySelector<HTMLElement>(FOLDED);
            if (host !== null) {
                host.setAttribute(STORY_TRIGGER_ATTRIBUTE, '');
                break;
            }
            await new Promise<void>((resolve: () => void): void => {
                setTimeout(resolve, 50);
            });
        }
        await openStoryOverlay(canvasElement);
    },
};
