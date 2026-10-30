import { Meta, StoryObj } from '@storybook/angular';

import { storyPseudoParameters, storyWidthAtLeast } from '../../../../../showcase';
import { TestRtChatMessageButtonsComponent } from './component/test-chat-message-buttons.component';

/**
 * Кнопки у реплики перед «…»-меню. Переписка объявляет свой порог ширины сама — 1441 px, — поэтому
 * кадр снят на этой ширине, как у матриц переписки.
 */
export default {
    title: 'Organisms/Chat/Chat Message Buttons',
    component: TestRtChatMessageButtonsComponent,
    parameters: {
        controls: { disable: true },
        snapshot: { widths: [storyWidthAtLeast(1441)] },
    },
} as Meta<TestRtChatMessageButtonsComponent>;

/** Панель у пузыря: кнопка «Ответить» и меню действий, проявленные наведением. */
export const Messenger: StoryObj<TestRtChatMessageButtonsComponent> = {
    parameters: { pseudo: storyPseudoParameters('.rt-chat__message-row') },
};
