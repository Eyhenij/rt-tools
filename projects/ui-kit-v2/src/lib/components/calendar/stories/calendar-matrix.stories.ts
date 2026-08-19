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
    title: 'Molecules/Forms/Calendar',
    component: TestRtCalendarMatrixComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { widths: [storyWidthAtMost(640), storyWidthAtMost(374)] },
    },
} as Meta<TestRtCalendarMatrixComponent>;

type TStory = StoryObj<TestRtCalendarMatrixComponent>;

export const DayState: TStory = { args: { part: 'dayState' } };

export const Range: TStory = { args: { part: 'range' } };

export const Months: TStory = { args: { part: 'months' } };

export const Nav: TStory = { args: { part: 'nav' } };

export const Sublabels: TStory = { args: { part: 'sublabels' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
