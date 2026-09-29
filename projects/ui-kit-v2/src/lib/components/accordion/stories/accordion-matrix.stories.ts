import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtAccordionMatrixComponent } from './component/test-accordion-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/Accordion',
    component: TestRtAccordionMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtAccordionMatrixComponent>;

type TStory = StoryObj<TestRtAccordionMatrixComponent>;

export const Opening: TStory = { args: { part: 'opening' } };

export const Length: TStory = { args: { part: 'length' } };

/**
 * Кольцо фокуса рисует кнопка пункта внутри хоста, а признак стоит на хосте — аддону передан спуск
 * до кнопки: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-accordion__toggle') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
