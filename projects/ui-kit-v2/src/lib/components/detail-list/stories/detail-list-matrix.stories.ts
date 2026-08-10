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

type Story = StoryObj<TestRtDetailListMatrixComponent>;

export const Loading: Story = { args: { part: 'loading' } };

export const Value: Story = { args: { part: 'value' } };

export const Length: Story = { args: { part: 'length' } };

export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
