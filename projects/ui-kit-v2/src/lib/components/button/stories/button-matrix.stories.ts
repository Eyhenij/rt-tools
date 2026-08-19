import { Meta, StoryObj } from '@storybook/angular';

import { STORY_PSEUDO_PARAMETERS } from '../../../../showcase/story-states';
import { TestRtButtonMatrixComponent } from './component/test-button-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно, состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Atoms/Buttons/Button',
    component: TestRtButtonMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtButtonMatrixComponent>;

type TStory = StoryObj<TestRtButtonMatrixComponent>;

export const Appearance: TStory = { args: { part: 'appearance' } };

export const Size: TStory = { args: { part: 'size' } };

export const Icon: TStory = { args: { part: 'icon' } };

export const Rounded: TStory = { args: { part: 'rounded' } };

export const Loading: TStory = { args: { part: 'loading' } };

export const Disabled: TStory = { args: { part: 'disabled' } };

/** Наведение, нажатие и фокус проставляет аддон псевдосостояний по признаку `data-story-state`. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

export const Themes: TStory = { args: { part: 'themes' } };
