import { Meta, StoryObj } from '@storybook/angular';

import { TestRtInfoItemMatrixComponent } from './component/test-info-item-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/InfoItem',
    component: TestRtInfoItemMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtInfoItemMatrixComponent>;

type Story = StoryObj<TestRtInfoItemMatrixComponent>;

export const Loading: Story = { args: { part: 'loading' } };

export const Grow: Story = { args: { part: 'grow' } };

export const Content: Story = { args: { part: 'content' } };

export const Themes: Story = { args: { part: 'themes' } };
