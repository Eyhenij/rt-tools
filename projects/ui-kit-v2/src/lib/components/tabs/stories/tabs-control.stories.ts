import { Meta, StoryObj } from '@storybook/angular';

import { TestRtTabsControlComponent } from './component/test-tabs-control.component';

export default {
    title: 'Components/TabsControl',
    component: TestRtTabsControlComponent,
    argTypes: {
        side: {
            options: ['left', 'right'],
            control: { type: 'select' },
        },
    },
} as Meta<TestRtTabsControlComponent>;

type Story = StoryObj<TestRtTabsControlComponent>;

export const Default: Story = {
    args: {
        side: 'right',
    },
};
