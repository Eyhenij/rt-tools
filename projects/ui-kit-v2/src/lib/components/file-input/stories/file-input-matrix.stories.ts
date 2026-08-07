import { Meta, StoryObj } from '@storybook/angular';

import { TestRtFileInputMatrixComponent } from './component/test-file-input-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 *
 * Историй наведения и фокуса нет: своих состояний взаимодействия у поля не бывает — они
 * принадлежат кнопке выбора и карточкам файлов и показаны в их матрицах.
 */
export default {
    title: 'Components/FileInput',
    component: TestRtFileInputMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtFileInputMatrixComponent>;

type Story = StoryObj<TestRtFileInputMatrixComponent>;

export const Filling: Story = { args: { part: 'filling' } };

export const Button: Story = { args: { part: 'button' } };

export const States: Story = { args: { part: 'states' } };

export const Themes: Story = { args: { part: 'themes' } };
