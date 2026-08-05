import { Meta, StoryObj } from '@storybook/angular';

import { TestRtPaginationComponent } from './component/test-pagination.component';

export default {
    title: 'Components/Pagination',
    component: TestRtPaginationComponent,
    argTypes: {
        pageModel: { control: false },
        perPageOptions: { control: false },
        loading: { control: { type: 'boolean' } },
    },
} as Meta<TestRtPaginationComponent>;

type Story = StoryObj<TestRtPaginationComponent>;

export const Default: Story = {
    args: {
        pageModel: { pageNumber: 1, pageSize: 20, totalCount: 137 },
        perPageOptions: [20, 50, 100],
        loading: false,
    },
};
