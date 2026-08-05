import { Meta, StoryObj } from '@storybook/angular';

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
    args: {
        steps: [],
    },
};
