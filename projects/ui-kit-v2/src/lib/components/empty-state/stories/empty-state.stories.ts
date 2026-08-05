import { Meta, StoryObj } from '@storybook/angular';

import { TestRtEmptyStateComponent } from './component/test-empty-state.component';

export default {
    title: 'Components/EmptyState',
    component: TestRtEmptyStateComponent,
    argTypes: {
        icon: { control: false },
        title: { control: { type: 'text' } },
        description: { control: { type: 'text' } },
    },
} as Meta<TestRtEmptyStateComponent>;

type Story = StoryObj<TestRtEmptyStateComponent>;

export const Default: Story = {
    args: {
        icon: null,
        title: 'Заголовок',
        description: 'Пояснение к полю',
    },
};
