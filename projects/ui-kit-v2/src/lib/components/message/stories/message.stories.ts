import { Meta, StoryObj } from '@storybook/angular';

import { TestRtMessageComponent } from './component/test-message.component';

export default {
    title: 'Components/Message',
    component: TestRtMessageComponent,
    argTypes: {
        severity: {
            options: ['info', 'success', 'warning', 'danger', 'secondary', 'neutral'],
            control: { type: 'select' },
        },
        icon: { control: false },
        hideIcon: { control: { type: 'boolean' } },
        closable: { control: { type: 'boolean' } },
    },
} as Meta<TestRtMessageComponent>;

type Story = StoryObj<TestRtMessageComponent>;

export const Default: Story = {
    args: {
        severity: 'info',
        icon: null,
        hideIcon: false,
        closable: false,
    },
};
