import { Meta, StoryObj } from '@storybook/angular';

import { AI_CHAT_DONE, AI_CHAT_SUGGESTIONS, AI_CHAT_THREADS } from './component/ai-chat.fixture';
import { TestRtAiChatComponent } from './component/test-ai-chat.component';

export default {
    title: 'Organisms/Chat/AiChat',
    component: TestRtAiChatComponent,
    argTypes: {
        messages: { control: false },
        suggestions: { control: false },
        threads: { control: false },
        error: { control: false },
        title: { control: { type: 'text' } },
        subtitle: { control: { type: 'text' } },
        sending: { control: { type: 'boolean' } },
        loading: { control: { type: 'boolean' } },
        fullScreenable: { control: { type: 'boolean' } },
        copyable: { control: { type: 'boolean' } },
        headerIconPreset: { control: { type: 'inline-radio' }, options: ['base', 'material'] },
        send: { action: 'send' },
        stop: { action: 'stop' },
        retry: { action: 'retry' },
        newThread: { action: 'newThread' },
        selectThread: { action: 'selectThread' },
        deleteThread: { action: 'deleteThread' },
        feedbackChange: { action: 'feedbackChange' },
    },
} as Meta<TestRtAiChatComponent>;

type TStory = StoryObj<TestRtAiChatComponent>;

export const Playground: TStory = {
    args: {
        title: '',
        subtitle: 'Occupancy last week',
        messages: AI_CHAT_DONE,
        suggestions: AI_CHAT_SUGGESTIONS,
        sending: false,
        loading: false,
        error: null,
        threads: AI_CHAT_THREADS,
        fullScreenable: true,
        copyable: true,
        headerIconPreset: 'base',
    },
};
