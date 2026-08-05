import { Meta, StoryObj } from '@storybook/angular';

import { TestRtToolbarLeftComponent } from './component/test-toolbar-left.component';

export default {
    title: 'Components/ToolbarLeft',
    component: TestRtToolbarLeftComponent,
    argTypes: {
        dense: { control: { type: 'boolean' } },
    },
} as Meta<TestRtToolbarLeftComponent>;

type Story = StoryObj<TestRtToolbarLeftComponent>;

export const Default: Story = {
    args: {
        dense: false,
    },
};
