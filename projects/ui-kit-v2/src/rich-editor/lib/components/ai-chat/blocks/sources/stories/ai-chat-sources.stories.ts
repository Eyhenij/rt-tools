import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../../../showcase';
import { TestRtAiChatSourcesComponent } from './component/test-ai-chat-sources.component';

export default {
    title: 'Organisms/Chat/AiChatSources',
    component: TestRtAiChatSourcesComponent,
    argTypes: {
        width: { control: { type: 'range', min: 240, max: 900, step: 4 } },
        title: { control: 'text' },
        detail: { control: 'text' },
        icon: { control: 'text' },
        url: { control: 'text' },
    },
} as Meta<TestRtAiChatSourcesComponent>;

type TStory = StoryObj<TestRtAiChatSourcesComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('свёрнутый блок с двумя источниками уже стоит в ячейке «свёрнут — 5» матрицы States'),
    args: {
        width: 386,
        title: 'Отчёт «Продажи»',
        detail: 'Ноябрь 2026 · все филиалы',
        icon: 'chart-bar',
        url: '/reports/sales',
    },
};
