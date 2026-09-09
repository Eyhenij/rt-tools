import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtToggleSwitchMatrixComponent } from './component/test-toggle-switch-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Forms/ToggleSwitch',
    component: TestRtToggleSwitchMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtToggleSwitchMatrixComponent>;

type TStory = StoryObj<TestRtToggleSwitchMatrixComponent>;

export const Size: TStory = { args: { part: 'size' } };

export const Value: TStory = { args: { part: 'value' } };

export const Icons: TStory = { args: { part: 'icons' } };

/**
 * Кольцо фокуса рисует кнопка внутри хоста, а признак стоит на хосте — аддону передан спуск
 * до неё: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-toggle-switch') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
