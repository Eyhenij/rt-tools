import { Meta, StoryObj } from '@storybook/angular';

import { TestRtChatStatesComponent } from './component/test-chat-states.component';

/** Заглушка без переписки и ошибка загрузки по одобренному кадру. Контролов нет: все случаи рядом. */
export default {
    title: 'Organisms/Chat/Chat',
    component: TestRtChatStatesComponent,
    parameters: {
        controls: { disable: true },
    },
} as Meta<TestRtChatStatesComponent>;

type TStory = StoryObj<TestRtChatStatesComponent>;

/** Переписка не выбрана, ошибка загрузки, свои шаблоны пустого и ошибки. */
export const ErrorAndPlaceholder: TStory = { parameters: { snapshot: { fullPage: true } } };
