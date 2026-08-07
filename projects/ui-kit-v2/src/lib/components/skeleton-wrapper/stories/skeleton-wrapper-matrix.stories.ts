import { Meta, StoryObj } from '@storybook/angular';

import { TestRtSkeletonWrapperMatrixComponent } from './component/test-skeleton-wrapper-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/SkeletonWrapper',
    component: TestRtSkeletonWrapperMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSkeletonWrapperMatrixComponent>;

type Story = StoryObj<TestRtSkeletonWrapperMatrixComponent>;

export const Loading: Story = { args: { part: 'loading' } };

export const Themes: Story = { args: { part: 'themes' } };
