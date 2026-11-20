import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../showcase';
import { ERtAiChatChartKind } from '../../../ai-chat-chart.enum';
import { TestRtAiChatChartComponent } from './component/test-ai-chat-chart.component';

export default {
    title: 'Organisms/Chat/AiChatChart',
    component: TestRtAiChatChartComponent,
    argTypes: {
        kind: { options: Object.values(ERtAiChatChartKind), control: { type: 'select' } },
        pending: { control: { type: 'boolean' } },
        invalid: { control: { type: 'boolean' } },
    },
} as Meta<TestRtAiChatChartComponent>;

type TStory = StoryObj<TestRtAiChatChartComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой line в матрице видов'),
    args: { kind: ERtAiChatChartKind.LINE, pending: false, invalid: false },
};
