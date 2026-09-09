import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMoneyListMatrixComponent } from './component/test-money-list-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Data/MoneyList',
    component: TestRtMoneyListMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMoneyListMatrixComponent>;

type TStory = StoryObj<TestRtMoneyListMatrixComponent>;

export const Total: TStory = { args: { part: 'total' } };

export const Loading: TStory = { args: { part: 'loading' } };

export const Length: TStory = { args: { part: 'length' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
