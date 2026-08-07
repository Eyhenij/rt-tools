import { Meta, StoryObj } from '@storybook/angular';

import { TestRtFieldMatrixComponent } from './component/test-field-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Историй наведения и фокуса у обёртки нет: своих состояний взаимодействия она не имеет,
 * они принадлежат контролу внутри и показаны в его матрице.
 */
export default {
    title: 'Components/Field',
    component: TestRtFieldMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFieldMatrixComponent>;

type Story = StoryObj<TestRtFieldMatrixComponent>;

export const Anatomy: Story = { args: { part: 'anatomy' } };

export const Required: Story = { args: { part: 'required' } };

export const Error: Story = { args: { part: 'error' } };

export const Hint: Story = { args: { part: 'hint' } };

export const Modes: Story = { args: { part: 'modes' } };

export const States: Story = { args: { part: 'states' } };

export const Themes: Story = { args: { part: 'themes' } };
