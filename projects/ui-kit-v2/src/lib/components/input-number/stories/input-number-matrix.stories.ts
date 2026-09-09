import { Meta, StoryObj } from '@storybook/angular';

import { STORY_PSEUDO_PARAMETERS } from '../../../../showcase/story-states';
import { TestRtInputNumberMatrixComponent } from './component/test-input-number-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Forms/InputNumber',
    component: TestRtInputNumberMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtInputNumberMatrixComponent>;

type TStory = StoryObj<TestRtInputNumberMatrixComponent>;

export const Size: TStory = { args: { part: 'size' } };

export const Prefix: TStory = { args: { part: 'prefix' } };

export const Fraction: TStory = { args: { part: 'fraction' } };

export const Filling: TStory = { args: { part: 'filling' } };

export const Bordered: TStory = { args: { part: 'bordered' } };

/** Наведение и фокус внутри проставляет аддон псевдосостояний по признаку `data-story-state`. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
