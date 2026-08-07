import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtCheckboxMatrixComponent } from './component/test-checkbox-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/Checkbox',
    component: TestRtCheckboxMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtCheckboxMatrixComponent>;

type Story = StoryObj<TestRtCheckboxMatrixComponent>;

export const Value: Story = { args: { part: 'value' } };

export const Label: Story = { args: { part: 'label' } };

/**
 * Кольцо фокуса рисует кнопка внутри хоста, а признак стоит на хосте — аддону передан спуск
 * до неё: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-checkbox') },
};

export const Themes: Story = { args: { part: 'themes' } };
