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

type TStory = StoryObj<TestRtSkeletonMatrixComponent>;

export const Shape: TStory = { args: { part: 'shape' } };

export const Radius: TStory = { args: { part: 'radius' } };

export const Animation: TStory = { args: { part: 'animation' } };

export const Themes: TStory = { args: { part: 'themes' } };
