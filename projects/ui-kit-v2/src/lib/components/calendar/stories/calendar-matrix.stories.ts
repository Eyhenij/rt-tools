import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtMost } from '../../../../showcase';
import { TestRtCalendarMatrixComponent } from './component/test-calendar-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Календарь объявляет свои пороги ширины сам — 640 px и 374 px, — поэтому у матриц есть кадры
 * на обоих: на них сетка месяца ужимается.
 */
export default {
    title: 'Components/Calendar',
    component: TestRtCalendarMatrixComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { widths: [storyWidthAtMost(640), storyWidthAtMost(374)] },
    },
} as Meta<TestRtCalendarMatrixComponent>;

type Story = StoryObj<TestRtCalendarMatrixComponent>;

export const DayState: Story = { args: { part: 'dayState' } };

export const Range: Story = { args: { part: 'range' } };

export const Months: Story = { args: { part: 'months' } };

export const Nav: Story = { args: { part: 'nav' } };

export const Sublabels: Story = { args: { part: 'sublabels' } };

export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
