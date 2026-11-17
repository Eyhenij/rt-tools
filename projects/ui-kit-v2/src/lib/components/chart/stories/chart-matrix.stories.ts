import { Meta, StoryObj } from '@storybook/angular';

import { TestRtChartMatrixComponent } from './component/test-chart-matrix.component';

/**
 * Карточки макета разом: семь видов, их формы и пустые данные. Контролов нет намеренно: случай,
 * до которого надо доехать переключателем, при беглом просмотре неотличим от отсутствующего.
 */
export default {
    title: 'Molecules/Data/Chart',
    component: TestRtChartMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtChartMatrixComponent>;

type TStory = StoryObj<TestRtChartMatrixComponent>;

/** Тринадцать карточек макета в светлой теме. */
export const Kinds: TStory = { args: { part: 'kinds' } };

/** Пустая опция: заглушка кита вместо осей. */
export const Empty: TStory = { args: { part: 'empty' } };

/** Те же карточки в светлой и тёмной половине: палитра читается с узла графика. */
export const Themes: TStory = { args: { part: 'themes' } };
