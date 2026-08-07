import { Meta, StoryObj } from '@storybook/angular';

import { TestRtSpinnerMatrixComponent } from './component/test-spinner-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Spinner',
    component: TestRtSpinnerMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtSpinnerMatrixComponent>;

type Story = StoryObj<TestRtSpinnerMatrixComponent>;

export const Color: Story = { args: { part: 'color' } };

export const Diameter: Story = { args: { part: 'diameter' } };

export const Themes: Story = { args: { part: 'themes' } };
