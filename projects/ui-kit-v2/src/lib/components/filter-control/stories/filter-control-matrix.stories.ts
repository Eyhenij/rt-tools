import { signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { BreakpointsService } from '../../../platform';
import { TestRtFilterControlMatrixComponent } from './component/test-filter-control-matrix.component';

/**
 * Служба брейкпоинтов, всегда отвечающая «узкий экран».
 *
 * Ширину окна витрины историей не задать, а второе представление фильтра выбирается именно по
 * ней. Подменяется поэтому источник ответа, а не окно: компонент спрашивает `narrow`, и в этой
 * истории ответ — «да».
 */
const NARROW_BREAKPOINTS: BreakpointsService = {
    mobile: signal(true),
    tablet: signal(false),
    desktop: signal(false),
    narrow: signal(true),
} as BreakpointsService;

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Наведение и фокус здесь не показываются: они принадлежат сегментам и списку, у которых свои
 * матрицы, — фильтр только выбирает, какой из двух контролов рисовать.
 */
export default {
    title: 'Components/FilterControl',
    component: TestRtFilterControlMatrixComponent,
    parameters: {
        // Фильтр называет ширину сам двумя правилами: на 1080 включается кап ширины поля, на
        // 768 — растяжение на всю строку. Кадр порога снимается на каждом.
        snapshot: { widths: [storyWidthAtMost(1080), storyWidthAtMost(768)] },
        controls: { disable: true },
    },
} as Meta<TestRtFilterControlMatrixComponent>;

type TStory = StoryObj<TestRtFilterControlMatrixComponent>;

export const Size: TStory = { args: { part: 'size' } };

export const Options: TStory = { args: { part: 'options' } };

export const Value: TStory = { args: { part: 'value' } };

export const FullWidth: TStory = { args: { part: 'fullWidth' } };

/** Второе представление того же набора: на экране ≤1080px сегменты уступают место списку. */
export const Narrow: TStory = {
    args: { part: 'narrow' },
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
};

export const States: TStory = { args: { part: 'states' } };

export const Themes: TStory = { args: { part: 'themes' } };
