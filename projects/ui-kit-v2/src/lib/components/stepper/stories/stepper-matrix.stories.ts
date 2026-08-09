import { Meta, StoryObj } from '@storybook/angular';

import { TestRtStepperMatrixComponent } from './component/test-stepper-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все случаи сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Stepper',
    component: TestRtStepperMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtStepperMatrixComponent>;

type Story = StoryObj<TestRtStepperMatrixComponent>;

export const Position: Story = { args: { part: 'position' } };

export const Length: Story = { args: { part: 'length' } };

export const Description: Story = { args: { part: 'description' } };

export const Edges: Story = { args: { part: 'edges' } };

export const Themes: Story = { args: { part: 'themes' } };
