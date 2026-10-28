import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtAiPromptInputComponent } from './component/test-ai-prompt-input.component';

export default {
    title: 'Molecules/Chat/AiPromptInput',
    component: TestRtAiPromptInputComponent,
    argTypes: {
        model: { control: { type: 'text' } },
        effort: { control: { type: 'text' } },
        mode: { control: { type: 'text' } },
        usage: { control: { type: 'range', min: 0, max: 100 } },
        usageHint: { control: { type: 'text' } },
        attachments: { control: { type: 'boolean' } },
        hintPosition: { control: { type: 'inline-radio' }, options: ['below', 'above'] },
        sending: { control: { type: 'boolean' } },
        stoppable: { control: { type: 'boolean' } },
        disabled: { control: { type: 'boolean' } },
        text: { control: { type: 'text' } },
    },
} as Meta<TestRtAiPromptInputComponent>;

type TStory = StoryObj<TestRtAiPromptInputComponent>;

const SKIP: string = 'снимки поля заводятся вместе с эталонами витрины следующей версии';

export const Playground: TStory = {
    parameters: storySnapshotSkip(SKIP),
    args: {},
};

export const Empty: TStory = {
    parameters: storySnapshotSkip(SKIP),
    args: { model: '', effort: '', mode: '', usage: null, attachments: false },
};

export const Typing: TStory = {
    parameters: storySnapshotSkip(SKIP),
    args: { text: 'Сколько броней на ноябрь и какая загрузка по неделям?' },
};

export const Sending: TStory = {
    parameters: storySnapshotSkip(SKIP),
    args: { sending: true, stoppable: false, text: 'Сколько броней на ноябрь?' },
};

export const Stoppable: TStory = {
    parameters: storySnapshotSkip(SKIP),
    args: { sending: true, stoppable: true },
};

export const Disabled: TStory = {
    parameters: storySnapshotSkip(SKIP),
    args: { disabled: true },
};

export const HintAbove: TStory = {
    parameters: storySnapshotSkip(SKIP),
    args: { hintPosition: 'above', usage: 81, usageHint: '81% of the monthly limit · Resets on 1 November' },
};
