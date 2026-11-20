import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../../../showcase';
import { TestRtAiChatKpiComponent } from './component/test-ai-chat-kpi.component';

export default {
    title: 'Organisms/Chat/AiChatKpi',
    component: TestRtAiChatKpiComponent,
    argTypes: {
        width: { control: { type: 'range', min: 240, max: 900, step: 4 } },
        count: { control: { type: 'range', min: 1, max: 4, step: 1 } },
    },
} as Meta<TestRtAiChatKpiComponent>;

type TStory = StoryObj<TestRtAiChatKpiComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой «386» в матрице Widths'),
    args: { width: 386, count: 4 },
};
