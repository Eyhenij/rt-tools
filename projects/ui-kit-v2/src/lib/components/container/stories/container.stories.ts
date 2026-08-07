import { Meta, StoryObj } from '@storybook/angular';

import { TestRtContainerComponent } from './component/test-container.component';

export default {
    title: 'Components/Container',
    component: TestRtContainerComponent,
    argTypes: {
        mobileLeftNav: {
            options: ['keep', 'bottom'],
            control: { type: 'select' },
        },
        height: {
            options: ['auto', 'viewport'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtContainerComponent>;

type Story = StoryObj<TestRtContainerComponent>;

export const Playground: Story = {
    args: {
        mobileLeftNav: 'keep',
        height: 'auto',
    },
};
