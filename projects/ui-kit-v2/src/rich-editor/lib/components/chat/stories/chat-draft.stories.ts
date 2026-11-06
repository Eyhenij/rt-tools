import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtLeast } from '../../../../../showcase';
import { CHAT_MESSAGES } from './component/chat.fixture';
import { TestRtChatDraftComponent } from './component/test-chat-draft.component';

export default {
    title: 'Organisms/Chat/ChatDraft',
    component: TestRtChatDraftComponent,
    // Переписка называет ширину сама: кадр целой страницей в окне ровно 1441, как у истории чата.
    parameters: { snapshot: { fullPage: true, widths: [storyWidthAtLeast(1441)] } },
    argTypes: {
        messages: { control: false },
        field: { options: ['classic', 'rich', 'formatting', 'messenger'], control: { type: 'select' } },
    },
} as Meta<TestRtChatDraftComponent>;

type TStory = StoryObj<TestRtChatDraftComponent>;

export const Classic: TStory = { args: { messages: CHAT_MESSAGES, field: 'classic' } };

export const Rich: TStory = { args: { messages: CHAT_MESSAGES, field: 'rich' } };

export const Formatting: TStory = { args: { messages: CHAT_MESSAGES, field: 'formatting' } };

export const Messenger: TStory = { args: { messages: CHAT_MESSAGES, field: 'messenger' } };
