import { Meta, StoryObj } from '@storybook/angular';

import { storySnapshotSkip } from '../../../../showcase';
import { TestRtTimelineComponent } from './component/test-timeline.component';

export default {
    title: 'Components/Timeline',
    component: TestRtTimelineComponent,
    argTypes: {
        steps: { control: false },
    },
} as Meta<TestRtTimelineComponent>;

type Story = StoryObj<TestRtTimelineComponent>;

export const Default: Story = {
    parameters: storySnapshotSkip(
        'обёртка отдаёт пустой `steps`, и лента событий пуста; пустой показ покрытием не считается, наполнение — волна покрытия составных компонентов'
    ),
    args: {
        steps: [],
    },
};
