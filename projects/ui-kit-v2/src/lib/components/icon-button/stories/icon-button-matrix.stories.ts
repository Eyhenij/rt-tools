import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters } from '../../../../showcase/story-states';
import { TestRtIconButtonMatrixComponent } from './component/test-icon-button-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, значение, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Buttons/IconButton',
    component: TestRtIconButtonMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtIconButtonMatrixComponent>;

type TStory = StoryObj<TestRtIconButtonMatrixComponent>;

export const Variant: TStory = { args: { part: 'variant' } };

export const Size: TStory = { args: { part: 'size' } };

export const IconSize: TStory = { args: { part: 'iconSize' } };

export const Shape: TStory = { args: { part: 'shape' } };

export const Flags: TStory = { args: { part: 'flags' } };

/**
 * Признак ставится на хост, а стилизована `<button>` внутри шаблона — поэтому аддону
 * псевдосостояний передан спуск до неё.
 */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: storyPseudoParameters('button') },
};

export const Themes: TStory = { args: { part: 'themes' } };
