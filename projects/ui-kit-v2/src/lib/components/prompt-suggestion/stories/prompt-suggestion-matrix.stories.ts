import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPromptSuggestionMatrixComponent } from './component/test-prompt-suggestion-matrix.component';

/**
 * Матрицы состояний — то, чего не показывает `Playground`: все значения оси сразу.
 * Контролов здесь нет намеренно.
 */
export default {
    title: 'Molecules/Chat/PromptSuggestion',
    component: TestRtPromptSuggestionMatrixComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtPromptSuggestionMatrixComponent>;

type TStory = StoryObj<TestRtPromptSuggestionMatrixComponent>;

export const List: TStory = { args: { part: 'list' } };

export const States: TStory = { args: { part: 'states' } };

export const Presets: TStory = { args: { part: 'presets' } };

export const Themes: TStory = { args: { part: 'themes' } };
