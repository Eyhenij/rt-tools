import { Meta, StoryObj } from '@storybook/angular';

import { TestRtEmptyStateMatrixComponent } from './component/test-empty-state-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/EmptyState',
    component: TestRtEmptyStateMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtEmptyStateMatrixComponent>;

type Story = StoryObj<TestRtEmptyStateMatrixComponent>;

export const Parts: Story = { args: { part: 'parts' } };

export const Slots: Story = { args: { part: 'slots' } };

export const Themes: Story = { args: { part: 'themes' } };
