import { Meta, StoryObj } from '@storybook/angular';

import { TestRtInfoItemMatrixComponent } from './component/test-info-item-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Data/InfoItem',
    component: TestRtInfoItemMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtInfoItemMatrixComponent>;

type TStory = StoryObj<TestRtInfoItemMatrixComponent>;

export const Loading: TStory = { args: { part: 'loading' } };

/** Полосы этот показ рисует сам, без сетки витрины, — корня показа на странице нет, и кадр
 * берётся целой страницей. */
export const Grow: TStory = {
    parameters: { snapshot: { fullPage: true } },
    args: { part: 'grow' },
};

export const Content: TStory = { args: { part: 'content' } };

export const Themes: TStory = { args: { part: 'themes' } };
