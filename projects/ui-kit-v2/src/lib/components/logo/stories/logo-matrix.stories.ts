import { Meta, StoryObj } from '@storybook/angular';

import { TestRtLogoMatrixComponent } from './component/test-logo-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Logo',
    component: TestRtLogoMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtLogoMatrixComponent>;

type TStory = StoryObj<TestRtLogoMatrixComponent>;

export const Variant: TStory = { args: { part: 'variant' } };

export const Height: TStory = { args: { part: 'height' } };

export const Aspect: TStory = { args: { part: 'aspect' } };

export const Themes: TStory = { args: { part: 'themes' } };
