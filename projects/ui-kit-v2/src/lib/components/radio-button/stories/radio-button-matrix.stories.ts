import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtRadioButtonMatrixComponent } from './component/test-radio-button-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Forms/RadioButton',
    component: TestRtRadioButtonMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtRadioButtonMatrixComponent>;

type TStory = StoryObj<TestRtRadioButtonMatrixComponent>;

export const Value: TStory = { args: { part: 'value' } };

export const Label: TStory = { args: { part: 'label' } };

export const Card: TStory = { args: { part: 'card' } };

/**
 * Кольцо фокуса рисует корень шаблона внутри хоста, а признак стоит на хосте — аддону передан спуск
 * до него: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-radio-button') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
