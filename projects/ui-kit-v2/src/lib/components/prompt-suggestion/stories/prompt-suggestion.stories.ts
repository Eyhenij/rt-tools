import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtPromptSuggestionComponent } from './component/test-prompt-suggestion.component';

export default {
    title: 'Molecules/Chat/PromptSuggestion',
    component: TestRtPromptSuggestionComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        disabled: { control: { type: 'boolean' } },
    },
} as Meta<TestRtPromptSuggestionComponent>;

type TStory = StoryObj<TestRtPromptSuggestionComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('подсказка уже стоит ячейкой в матрице этого компонента'),
    args: {
        label: 'Give me a performance overview',
        disabled: false,
    },
};
