import { Meta, StoryObj } from '@storybook/angular';

import { TestRtLiveBadgeComponent } from './component/test-live-badge.component';

export default {
    title: 'Components/LiveBadge',
    component: TestRtLiveBadgeComponent,
    argTypes: {
        label: { control: { type: 'text' } },
        count: { control: { type: 'number' } },
        active: { control: { type: 'boolean' } },
    },
} as Meta<TestRtLiveBadgeComponent>;

type Story = StoryObj<TestRtLiveBadgeComponent>;

export const Default: Story = {
    args: {
        label: 'Сохранить',
        count: null,
        active: false,
    },
};
