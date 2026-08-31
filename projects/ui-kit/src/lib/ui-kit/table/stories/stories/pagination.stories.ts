import { Meta, StoryObj } from '@storybook/angular';

import TestPaginationComponent from '../pagination/test-pagination-component';

export default {
    title: 'Components/Pagination',
    component: TestPaginationComponent,
} as Meta<TestPaginationComponent>;

type TStory = StoryObj<TestPaginationComponent>;

export const Pagination: TStory = {
    args: {
        pageModel: {
            pageNumber: 1,
            pageSize: 10,
            totalCount: 10000,
            hasPrev: false,
            hasNext: true,
        },
    },
};
