import { Meta, StoryObj } from '@storybook/angular';

import { STORY_PSEUDO_PARAMETERS } from '../../../../showcase/story-states';
import { TestRtDatePickerMatrixComponent } from './component/test-date-picker-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно: состояние, до которого надо доехать переключателем,
 * при беглом просмотре неотличимо от отсутствующего.
 */
export default {
    title: 'Components/DatePicker',
    component: TestRtDatePickerMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtDatePickerMatrixComponent>;

type TStory = StoryObj<TestRtDatePickerMatrixComponent>;

export const Size: TStory = { args: { part: 'size' } };

export const Type: TStory = { args: { part: 'type' } };

export const Filling: TStory = { args: { part: 'filling' } };

export const Bordered: TStory = { args: { part: 'bordered' } };

/** Наведение и фокус внутри проставляет аддон псевдосостояний по признаку `data-story-state`. */
export const States: TStory = {
    args: { part: 'states' },
    parameters: { pseudo: STORY_PSEUDO_PARAMETERS },
};

export const Themes: TStory = { args: { part: 'themes' } };
