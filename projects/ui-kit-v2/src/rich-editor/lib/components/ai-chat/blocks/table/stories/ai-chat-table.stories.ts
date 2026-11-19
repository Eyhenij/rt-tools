import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../../../../showcase';
import { TestRtAiChatTableComponent } from './component/test-ai-chat-table.component';

export default {
    title: 'Organisms/Chat/AiChatTable',
    component: TestRtAiChatTableComponent,
    argTypes: {
        title: { control: { type: 'text' } },
        withTotal: { control: { type: 'boolean' } },
        width: { control: { type: 'range', min: 280, max: 760, step: 4 } },
    },
} as Meta<TestRtAiChatTableComponent>;

type TStory = StoryObj<TestRtAiChatTableComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой «с итогом» в матрице WithTotal'),
    args: { title: 'Выручка по типам номеров', withTotal: true, width: 328 },
};
