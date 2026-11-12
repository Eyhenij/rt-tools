import { Meta, StoryObj } from '@storybook/angular';

import { TestRtChatDeletedComponent } from './component/test-chat-deleted.component';

/** Снятая реплика остаётся в ленте подписью: её вид в мессенджере показан в обеих темах. */
export default {
    title: 'Organisms/Chat/Deleted',
    component: TestRtChatDeletedComponent,
    parameters: { controls: { disable: true }, snapshot: { fullPage: true } },
} as Meta<TestRtChatDeletedComponent>;

/** Входящая и своя снятые реплики: пузырь без заливки, приглушённые подпись, время и знак. */
export const Messenger: StoryObj<TestRtChatDeletedComponent> = {};
