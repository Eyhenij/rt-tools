import { Meta, StoryObj } from '@storybook/angular';

import { TestRtHeaderComponent } from './component/test-header.component';

export default {
    title: 'Components/Header',
    component: TestRtHeaderComponent,
    argTypes: {
        canGoBack: { control: { type: 'boolean' } },
        showInvite: { control: { type: 'boolean' } },
    },
} as Meta<TestRtHeaderComponent>;

type Story = StoryObj<TestRtHeaderComponent>;

export const Default: Story = {
    args: {
        canGoBack: false,
        showInvite: false,
    },
};
