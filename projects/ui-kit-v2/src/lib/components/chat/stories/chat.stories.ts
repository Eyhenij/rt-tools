import { Meta, StoryObj } from '@storybook/angular';

import { storyWidthAtLeast } from '../../../../showcase';
import { TestRtChatComponent } from './component/test-chat.component';

export default {
    title: 'Organisms/Chat/Chat',
    component: TestRtChatComponent,
    // Показ рисует не сетка витрины, поэтому кадр целой страницей. Переписка называет ширину
    // сама: `@media (width >= 1441px)` расширяет колонку сообщений. Кадр — в окне ровно 1441.
    parameters: { snapshot: { fullPage: true, widths: [storyWidthAtLeast(1441)] } },
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

type TStory = StoryObj<TestRtChatComponent>;

export const Default: TStory = {
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
