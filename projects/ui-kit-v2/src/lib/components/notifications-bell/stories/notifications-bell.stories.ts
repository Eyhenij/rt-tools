import { Meta, StoryObj } from '@storybook/angular';

import { TestRtNotificationsBellComponent } from './component/test-notifications-bell.component';

export default {
    title: 'Molecules/NotificationsBell',
    component: TestRtNotificationsBellComponent,
    parameters: { snapshot: { fullPage: true } },
    argTypes: {
        unread: { control: { type: 'boolean' } },
        ariaLabel: { control: { type: 'text' } },
        unreadLabel: { control: { type: 'text' } },
    },
} as Meta<TestRtNotificationsBellComponent>;

type TStory = StoryObj<TestRtNotificationsBellComponent>;

export const Playground: TStory = {
    args: {
        unread: false,
        ariaLabel: '',
        unreadLabel: '',
    },
};
