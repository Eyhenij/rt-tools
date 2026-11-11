import { Meta, StoryObj } from '@storybook/angular';

import { TestRtChatReplyKindsComponent } from './component/test-chat-reply-kinds.component';

/** Слот над полем и чтение черновика во всех трёх видах поля ответа. */
export default {
    title: 'Organisms/Chat/Reply kinds',
    component: TestRtChatReplyKindsComponent,
    parameters: { controls: { disable: true }, layout: 'fullscreen', snapshot: { fullPage: true } },
} as Meta<TestRtChatReplyKindsComponent>;

export const AllKinds: StoryObj<TestRtChatReplyKindsComponent> = {};
