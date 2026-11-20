import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../../../showcase';
import { TestRtAiChatLinkComponent } from './component/test-ai-chat-link.component';

export default {
    title: 'Organisms/Chat/AiChatLink',
    component: TestRtAiChatLinkComponent,
    argTypes: {
        width: { control: { type: 'range', min: 240, max: 900, step: 4 } },
        title: { control: 'text' },
        section: { control: 'text' },
        icon: { control: 'text' },
        state: { control: 'inline-radio', options: ['none', 'pending', 'opened', 'failed'] },
        reason: { control: 'text' },
    },
} as Meta<TestRtAiChatLinkComponent>;

type TStory = StoryObj<TestRtAiChatLinkComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят карточкой «opened» в ячейке «386» матрицы Widths'),
    args: {
        width: 386,
        title: 'Продажи за ноябрь',
        section: 'Отчёты · Продажи',
        icon: 'chart-bar',
        state: 'opened',
        reason: 'Нет доступа к разделу «Отчёты»',
    },
};
