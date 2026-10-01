import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtExpansionPanelMatrixComponent } from './component/test-expansion-panel-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу. Контролов здесь
 * нет намеренно: состояние, до которого надо доехать переключателем, при беглом просмотре
 * неотличимо от отсутствующего.
 */
export default {
    title: 'Molecules/ExpansionPanel',
    component: TestRtExpansionPanelMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtExpansionPanelMatrixComponent>;

type TStory = StoryObj<TestRtExpansionPanelMatrixComponent>;

export const Appearance: TStory = { args: { part: 'appearance' } };

export const Opening: TStory = { args: { part: 'opening' } };

export const Length: TStory = { args: { part: 'length' } };

/**
 * Наведение, нажатие и кольцо фокуса рисует кнопка заголовка внутри хоста, а признак стоит на
 * хосте — аддону передан спуск до кнопки.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-expansion-panel__header') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
