import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtAiRunStatusComponent } from './component/test-ai-run-status.component';

export default {
    title: 'Molecules/Chat/AiRunStatus',
    component: TestRtAiRunStatusComponent,
    argTypes: {
        state: { control: { type: 'select' }, options: ['running', 'done', 'stopped', 'failed'] },
        label: { control: { type: 'text' } },
        meta: { control: { type: 'text' } },
        withSteps: { control: { type: 'boolean' } },
        expanded: { control: { type: 'boolean' } },
    },
} as Meta<TestRtAiRunStatusComponent>;

type TStory = StoryObj<TestRtAiRunStatusComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('состояния и раскрытие уже стоят ячейками в матрице этого компонента'),
    args: {
        state: 'running',
        label: 'Fetching daily performance briefing',
        meta: '14s',
        withSteps: true,
        expanded: false,
    },
};
