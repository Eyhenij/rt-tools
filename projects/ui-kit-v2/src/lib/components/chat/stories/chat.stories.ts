import { Meta, StoryObj } from '@storybook/angular';

import { TestRtChatComponent } from './component/test-chat.component';

export default {
    title: 'Components/Chat',
    component: TestRtChatComponent,
    argTypes: {
        messages: { control: false },
        loading: { control: { type: 'boolean' } },
        fetching: { control: { type: 'boolean' } },
        canReply: { control: { type: 'boolean' } },
        replyBlockReason: { control: { type: 'text' } },
        sending: { control: { type: 'boolean' } },
        placeholder: { control: { type: 'text' } },
        title: { control: { type: 'text' } },
        emptyHint: { control: { type: 'text' } },
        hasThread: { control: { type: 'boolean' } },
        attachments: { control: { type: 'boolean' } },
        accept: { control: { type: 'text' } },
        richComposer: { control: { type: 'boolean' } },
        formatting: { control: { type: 'boolean' } },
        formattingToolbar: {
            options: ['full', 'minimal'],
            control: { type: 'select' },
        },
        fill: { control: { type: 'boolean' } },
        showRefresh: { control: { type: 'boolean' } },
        showExpand: { control: { type: 'boolean' } },
    },
} as Meta<TestRtChatComponent>;

type Story = StoryObj<TestRtChatComponent>;

export const Default: Story = {
    args: {
        messages: [],
        loading: false,
        fetching: false,
        canReply: false,
        replyBlockReason: null,
        sending: false,
        placeholder: 'Введите значение',
        title: 'Заголовок',
        emptyHint: '',
        hasThread: false,
        attachments: false,
        accept: '',
        richComposer: false,
        formatting: false,
        formattingToolbar: 'full',
        fill: false,
        showRefresh: false,
        showExpand: false,
    },
};
