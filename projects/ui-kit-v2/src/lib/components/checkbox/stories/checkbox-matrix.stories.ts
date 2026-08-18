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

type TStory = StoryObj<TestRtCheckboxMatrixComponent>;

export const Value: TStory = { args: { part: 'value' } };

export const Label: TStory = { args: { part: 'label' } };

/**
 * Кольцо фокуса рисует кнопка внутри хоста, а признак стоит на хосте — аддону передан спуск
 * до неё: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-checkbox') },
};

export const Themes: TStory = { args: { part: 'themes' } };
