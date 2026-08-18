import { Meta, StoryObj } from '@storybook/angular';

import { TestRtLiveBadgeMatrixComponent } from './component/test-live-badge-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/LiveBadge',
    component: TestRtLiveBadgeMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtLiveBadgeMatrixComponent>;

type TStory = StoryObj<TestRtLiveBadgeMatrixComponent>;

export const Active: TStory = { args: { part: 'active' } };

export const Label: TStory = { args: { part: 'label' } };

export const Themes: TStory = { args: { part: 'themes' } };
