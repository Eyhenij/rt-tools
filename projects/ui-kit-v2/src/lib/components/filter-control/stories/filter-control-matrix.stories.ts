import { signal, Signal } from '@angular/core';
import { applicationConfig, Meta, StoryObj } from '@storybook/angular';

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
    mobile: signal(true) as Signal<boolean>,
    tablet: signal(false) as Signal<boolean>,
    desktop: signal(false) as Signal<boolean>,
    narrow: signal(true) as Signal<boolean>,
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
        controls: { disable: true },
    },
} as Meta<TestRtFilterControlMatrixComponent>;

type Story = StoryObj<TestRtFilterControlMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

export const Options: Story = { args: { part: 'options' } };

export const Value: Story = { args: { part: 'value' } };

export const FullWidth: Story = { args: { part: 'fullWidth' } };

/** Второе представление того же набора: на экране ≤1080px сегменты уступают место списку. */
export const Narrow: Story = {
    args: { part: 'narrow' },
    decorators: [
        applicationConfig({
            providers: [{ provide: BreakpointsService, useValue: NARROW_BREAKPOINTS }],
        }),
    ],
};

export const States: Story = { args: { part: 'states' } };

export const Themes: Story = { args: { part: 'themes' } };
