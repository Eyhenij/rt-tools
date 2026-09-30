import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtDateRangeComponent } from './component/test-date-range.component';

export default {
    title: 'Organisms/Forms/DateRange',
    component: TestRtDateRangeComponent,
    argTypes: {
        min: { control: { type: 'text' } },
        max: { control: { type: 'text' } },
    },
} as Meta<TestRtDateRangeComponent>;

type TStory = StoryObj<TestRtDateRangeComponent>;

export const Playground: TStory = {
    parameters: storySnapshotSkip('значения по умолчанию уже стоят ячейкой в матрице этого компонента'),
    args: {
        min: null,
        max: null,
    },
};
