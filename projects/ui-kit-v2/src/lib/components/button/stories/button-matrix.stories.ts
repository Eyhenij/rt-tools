import { Meta, StoryObj } from '@storybook/angular';

import { TestRtButtonMatrixComponent } from './component/test-button-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, состояние до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Button',
    component: TestRtButtonMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtButtonMatrixComponent>;

type Story = StoryObj<TestRtButtonMatrixComponent>;

export const States: Story = {};
