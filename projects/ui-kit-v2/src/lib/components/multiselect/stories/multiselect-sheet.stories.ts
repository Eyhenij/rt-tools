import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { openStoryOverlay } from '../../../../showcase/story-overlay';
import { BreakpointsService } from '../../../platform';
import { TestRtMultiselectMatrixComponent } from './component/test-multiselect-matrix.component';

/**
 * Служба брейкпоинтов, всегда отвечающая «узкий экран». Шторка нужна узкому окну, а окно до `play`
 * историей не задать: поле открылось бы рядом с собой. Поэтому подменяется источник ответа:
 * «узкий» с первой отрисовки.
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

/** Окно телефона из макета 8293:3691. */
const PHONE_WINDOW: { readonly width: number; readonly height: number } = { width: 375, height: 812 };

/**
 * Мультиселект с переключателями на узком экране: панель открывается в нижней шторке, без подвала.
 * Поле открывает `play`, шторка стоит в оверлее, поэтому кадр снимает всю страницу.
 */
export default {
    title: 'Molecules/Forms/MultiselectSheet',
    component: TestRtMultiselectMatrixComponent,
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMultiselectMatrixComponent>;

type TStory = StoryObj<TestRtMultiselectMatrixComponent>;

/** Узкий экран: «Показать все», «Скрыть пустые», черта и переключатель на каждую категорию. */
export const TogglesSheet: TStory = {
    args: { part: 'toggles-panel' },
    parameters: { snapshot: { fullPage: true, overlay: '.rt-popover-sheet', viewport: PHONE_WINDOW } },
    play: async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        await openStoryOverlay(canvasElement, { key: 'ArrowDown' });
    },
};
