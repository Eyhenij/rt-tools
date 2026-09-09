import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtTextareaMatrixComponent } from './component/test-textarea-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Forms/Textarea',
    component: TestRtTextareaMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtTextareaMatrixComponent>;

type TStory = StoryObj<TestRtTextareaMatrixComponent>;

export const Size: TStory = { args: { part: 'size' } };

export const Rows: TStory = { args: { part: 'rows' } };

export const Resize: TStory = { args: { part: 'resize' } };

export const Filling: TStory = { args: { part: 'filling' } };

export const Bordered: TStory = { args: { part: 'bordered' } };

/**
 * Рамку рисует сам `<textarea>`, а признак стоит на хосте — поэтому аддону передан спуск
 * до контрола: без него класс лёг бы на элемент, у которого этих правил нет.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('.rt-textarea__control') },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
