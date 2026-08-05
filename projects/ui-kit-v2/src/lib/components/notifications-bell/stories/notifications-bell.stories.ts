import { Meta, StoryObj } from '@storybook/angular';

import { TestRtNotificationsBellComponent } from './component/test-notifications-bell.component';

export default {
    title: 'Components/NotificationsBell',
    component: TestRtNotificationsBellComponent,
    argTypes: {
        unread: { control: { type: 'boolean' } },
        ariaLabel: { control: { type: 'text' } },
        unreadLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtNotificationsBellComponent>;

type Story = StoryObj<TestRtNotificationsBellComponent>;

export const Default: Story = {
    args: {
        unread: false,
        ariaLabel: '',
        unreadLabel: '',
    },
};
