import { Meta, StoryObj } from '@storybook/angular';

import { TestRtChatTranslationComponent } from './component/test-chat-translation.component';

/** Перевод реплики: подпись перевода у времени и кнопка возврата перевода под оригиналом. */
export default {
    title: 'Organisms/Chat/Translation',
    component: TestRtChatTranslationComponent,
    parameters: { controls: { disable: true }, snapshot: { fullPage: true } },
} as Meta<TestRtChatTranslationComponent>;

/** Переведённая реплика, оригинал с кнопкой и ответ без перевода в обоих видах и обеих темах. */
export const BothLooks: StoryObj<TestRtChatTranslationComponent> = {};
