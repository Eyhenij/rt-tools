import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDetailListMatrixComponent } from './component/test-detail-list-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/DetailList',
    component: TestRtDetailListMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDetailListMatrixComponent>;

type TStory = StoryObj<TestRtDetailListMatrixComponent>;

export const Loading: TStory = { args: { part: 'loading' } };

export const Value: TStory = { args: { part: 'value' } };

export const Length: TStory = { args: { part: 'length' } };

export const Edges: TStory = { args: { part: 'edges' } };

export const Themes: TStory = { args: { part: 'themes' } };
