import { Meta, StoryObj } from '@storybook/angular';

import { TestRtContainerComponent } from './component/test-container.component';

export default {
    title: 'Components/Container',
    component: TestRtContainerComponent,
    argTypes: {
        mobileLeftNav: { control: false },
        height: { control: false },
    },
} as Meta<TestRtContainerComponent>;

type Story = StoryObj<TestRtContainerComponent>;

export const Default: Story = {
    args: {
        mobileLeftNav: 'keep',
        height: 'auto',
    },
};
