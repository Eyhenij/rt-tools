import { Meta, StoryObj } from '@storybook/angular';

import { TestRtBarListComponent } from './component/test-bar-list.component';

export default {
    title: 'Components/BarList',
    component: TestRtBarListComponent,
    argTypes: {
        rows: { control: false },
        title: { control: { type: 'text' } },
        emptyText: { control: { type: 'text' } },
    },
} as Meta<TestRtBarListComponent>;

type Story = StoryObj<TestRtBarListComponent>;

export const Default: Story = {
    args: {
        rows: [],
        title: 'Заголовок',
        emptyText: 'Ничего не найдено',
    },
};
