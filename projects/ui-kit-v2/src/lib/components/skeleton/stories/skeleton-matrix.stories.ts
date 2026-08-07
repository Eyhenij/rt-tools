import { Meta, StoryObj } from '@storybook/angular';

import { TestRtSkeletonMatrixComponent } from './component/test-skeleton-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Skeleton',
    component: TestRtSkeletonMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSkeletonMatrixComponent>;

type Story = StoryObj<TestRtSkeletonMatrixComponent>;

export const Shape: Story = { args: { part: 'shape' } };

export const Radius: Story = { args: { part: 'radius' } };

export const Animation: Story = { args: { part: 'animation' } };

export const Themes: Story = { args: { part: 'themes' } };
