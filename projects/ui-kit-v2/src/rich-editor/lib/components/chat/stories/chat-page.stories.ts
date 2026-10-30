import { Meta, StoryObj } from '@storybook/angular';

import { TestRtChatPageComponent } from './component/test-chat-page.component';

/**
 * Страница переписки целиком: список, разговор и сведения о госте в рабочем месте с карточками.
 * Ширина и высота — как у рабочего места в кадре экрана, чтобы историю можно было наложить на кадр.
 */
export default {
    title: 'Organisms/Chat/Page',
    component: TestRtChatPageComponent,
    parameters: { controls: { disable: true }, layout: 'fullscreen' },
} as Meta<TestRtChatPageComponent>;

export const Page: StoryObj<TestRtChatPageComponent> = {};
