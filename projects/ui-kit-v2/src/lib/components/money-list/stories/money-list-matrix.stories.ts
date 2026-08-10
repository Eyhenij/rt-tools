import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMoneyListMatrixComponent } from './component/test-money-list-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/MoneyList',
    component: TestRtMoneyListMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtMoneyListMatrixComponent>;

type Story = StoryObj<TestRtMoneyListMatrixComponent>;

export const Total: Story = { args: { part: 'total' } };

export const Loading: Story = { args: { part: 'loading' } };

export const Length: Story = { args: { part: 'length' } };

export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
