import { Meta, StoryObj } from '@storybook/angular';

import { TestRtDeltaViewComponent } from './component/test-delta-view.component';

export default {
    title: 'Components/DeltaView',
    component: TestRtDeltaViewComponent,
    argTypes: {
        delta: { control: false },
    },
} as Meta<TestRtDeltaViewComponent>;

type Story = StoryObj<TestRtDeltaViewComponent>;

export const Default: Story = {
    args: {
        delta: null,
    },
};
