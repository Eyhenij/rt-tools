import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtToggleSwitchMatrixComponent } from './component/test-toggle-switch-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/ToggleSwitch',
    component: TestRtToggleSwitchMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtToggleSwitchMatrixComponent>;

type Story = StoryObj<TestRtToggleSwitchMatrixComponent>;

export const Size: Story = { args: { part: 'size' } };

export const Value: Story = { args: { part: 'value' } };

export const Icons: Story = { args: { part: 'icons' } };

/**
 * Кольцо фокуса рисует кнопка внутри хоста, а признак стоит на хосте — аддону передан спуск
 * до неё: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: Story = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-toggle-switch') },
};

export const Themes: Story = { args: { part: 'themes' } };
