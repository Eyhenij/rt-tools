import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtTextareaMatrixComponent } from './component/test-textarea-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Textarea',
    component: TestRtTextareaMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTextareaMatrixComponent>;

type Story = StoryObj<TestRtTextareaMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

export const Rows: Story = { args: { part: 'rows' } };

export const Resize: Story = { args: { part: 'resize' } };

export const Filling: Story = { args: { part: 'filling' } };

export const Bordered: Story = { args: { part: 'bordered' } };

/**
 * Рамку рисует сам `<textarea>`, а признак стоит на хосте — поэтому аддону передан спуск
 * до контрола: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-textarea__control') },
};

export const Themes: Story = { args: { part: 'themes' } };
