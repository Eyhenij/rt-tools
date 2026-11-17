import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { CHART_CASES } from './component/chart.fixture';
import { TestRtChartComponent } from './component/test-chart.component';

export default {
    title: 'Molecules/Data/Chart',
    component: TestRtChartComponent,
    argTypes: {
        data: { control: { type: 'object' } },
        height: { control: { type: 'text' } },
    },
} as Meta<TestRtChartComponent>;

type TStory = StoryObj<TestRtChartComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('та же линия стоит первой карточкой в истории Kinds'),
    args: {
        data: CHART_CASES[0].data,
        height: '188px',
    },
};
