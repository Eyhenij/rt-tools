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

type Story = StoryObj<TestRtLogoMatrixComponent>;

export const Variant: Story = { args: { part: 'variant' } };

export const Height: Story = { args: { part: 'height' } };

export const Aspect: Story = { args: { part: 'aspect' } };

export const Themes: Story = { args: { part: 'themes' } };
